// Shared rate limiting for the agent surfaces (/api/concierge and
// /mcp): fixed-window counters backed by Upstash Redis when configured,
// falling back to in-memory per-instance counters when not (local dev,
// tests, or an Upstash outage). One implementation, both endpoints.
//
// Design notes:
// - Fixed windows, not sliding: each Redis key embeds its window start
//   (`{prefix}:{rule}:{scope}:{windowStart}`), so a new window is a new
//   key and correctness never depends on TTL. EXPIRE is only cleanup.
// - One REST pipeline call checks every rule (INCR + EXPIRE per rule).
// - Fail-open to memory, never closed: if Redis is unreachable the
//   in-memory counters still fence this instance; an outage must not
//   take the endpoints down. These are fences, not walls.
// - Config is injected (no env reads here) so bun tests can exercise
//   both modes without varlock.

export interface LimitRule {
	/** short name, used in the Redis key and the blocked verdict */
	name: string;
	/** max requests per window */
	max: number;
	/** window length in seconds */
	windowSec: number;
	/** "ip" keys the counter by caller IP; "global" is one shared counter */
	scope: "ip" | "global";
}

export type LimitVerdict =
	| { ok: true }
	| { ok: false; rule: string; retryAfterSec: number };

export interface RateLimiterConfig {
	/** key prefix, e.g. "rl:concierge" */
	prefix: string;
	rules: LimitRule[];
	/** Upstash REST endpoint; memory-only when absent */
	redisUrl?: string;
	redisToken?: string;
	/** injected for tests; defaults to global fetch */
	fetchImpl?: typeof globalThis.fetch;
	/** Redis round-trip budget before falling back to memory */
	timeoutMs?: number;
}

interface MemoryEntry {
	count: number;
	windowStart: number;
}

export function createRateLimiter(config: RateLimiterConfig) {
	const {
		prefix,
		rules,
		redisUrl,
		redisToken,
		fetchImpl = globalThis.fetch,
		timeoutMs = 500,
	} = config;
	const redisReady = Boolean(redisUrl && redisToken);
	const memory = new Map<string, MemoryEntry>();
	let warnedRedisDown = false;

	const windowStart = (nowSec: number, rule: LimitRule) =>
		Math.floor(nowSec / rule.windowSec) * rule.windowSec;

	const retryAfter = (nowSec: number, rule: LimitRule) =>
		windowStart(nowSec, rule) + rule.windowSec - nowSec;

	const keyFor = (rule: LimitRule, ip: string, nowSec: number) =>
		`${prefix}:${rule.name}:${rule.scope === "ip" ? ip : "all"}:${windowStart(nowSec, rule)}`;

	function checkMemory(ip: string, nowSec: number): LimitVerdict {
		for (const rule of rules) {
			const key = keyFor(rule, ip, nowSec);
			const entry = memory.get(key);
			const count = (entry?.count ?? 0) + 1;
			memory.set(key, { count, windowStart: windowStart(nowSec, rule) });
			if (count > rule.max)
				return {
					ok: false,
					rule: rule.name,
					retryAfterSec: retryAfter(nowSec, rule),
				};
		}
		if (memory.size > 10_000) {
			// windows in the keys make stale entries self-identifying
			for (const [k, v] of memory) {
				const sec = Number(k.slice(k.lastIndexOf(":") + 1));
				if (Number.isFinite(sec) && v.windowStart < nowSec - 86_400)
					memory.delete(k);
			}
			if (memory.size > 10_000) memory.clear(); // crude final bound
		}
		return { ok: true };
	}

	async function checkRedis(
		ip: string,
		nowSec: number,
	): Promise<LimitVerdict | null> {
		// one pipeline: INCR + EXPIRE per rule; EXPIRE is cleanup only
		const commands: (string | number)[][] = [];
		for (const rule of rules) {
			const key = keyFor(rule, ip, nowSec);
			commands.push(["INCR", key]);
			commands.push(["EXPIRE", key, rule.windowSec * 2]);
		}
		const res = await fetchImpl(`${redisUrl}/pipeline`, {
			method: "POST",
			headers: {
				authorization: `Bearer ${redisToken}`,
				"content-type": "application/json",
			},
			body: JSON.stringify(commands),
			signal: AbortSignal.timeout(timeoutMs),
		});
		if (!res.ok) throw new Error(`redis pipeline ${res.status}`);
		const results = (await res.json()) as {
			result?: unknown;
			error?: string;
		}[];
		for (let i = 0; i < rules.length; i++) {
			const slot = results[i * 2]; // the INCR for rule i
			if (!slot || slot.error) throw new Error(slot?.error ?? "missing result");
			const count = Number(slot.result);
			const rule = rules[i];
			if (count > rule.max)
				return {
					ok: false,
					rule: rule.name,
					retryAfterSec: retryAfter(nowSec, rule),
				};
		}
		return { ok: true };
	}

	return {
		/** true when counters are shared across instances via Redis */
		distributed: redisReady,
		async check(ip: string): Promise<LimitVerdict> {
			const nowSec = Math.floor(Date.now() / 1000);
			if (redisReady) {
				try {
					const verdict = await checkRedis(ip, nowSec);
					if (verdict) return verdict;
				} catch (err) {
					if (!warnedRedisDown) {
						warnedRedisDown = true;
						console.warn(
							`rateLimit(${prefix}): redis unavailable, using in-memory fallback`,
							err,
						);
					}
				}
			}
			return checkMemory(ip, nowSec);
		},
	};
}
