// Last-known-good cache for CMS fetches: every successful fetch stores
// its result; when the CMS is down, the stored copy serves instead of a
// 500. Born from the 2026-08-10 Replicator outage, which turned every
// CMS-backed route (including the homepage) into an error page — for a
// marketing site, slightly stale content beats no site every time.
//
// Upstash-backed when configured, so an instance that never saw the
// data can still recover a copy written by another; an in-memory map
// serves as fallback and fast path either way. Config is injected (no
// env reads) so bun tests can exercise both modes.

export interface LastKnownGoodConfig {
	/** key prefix, e.g. "lkg:v1" */
	prefix: string;
	/** how long a stored copy stays servable (default 7 days) */
	ttlSec?: number;
	/** Upstash REST endpoint; memory-only when absent */
	redisUrl?: string;
	redisToken?: string;
	/** injected for tests; defaults to global fetch */
	fetchImpl?: typeof globalThis.fetch;
	/** Redis round-trip budget */
	timeoutMs?: number;
	/** skip storing values whose JSON exceeds this (Upstash limits) */
	maxValueBytes?: number;
}

export function createLastKnownGood(config: LastKnownGoodConfig) {
	const {
		prefix,
		ttlSec = 7 * 24 * 60 * 60,
		redisUrl,
		redisToken,
		fetchImpl = globalThis.fetch,
		timeoutMs = 800,
		maxValueBytes = 900_000,
	} = config;
	const redisReady = Boolean(redisUrl && redisToken);
	const memory = new Map<string, string>();
	let warnedRedisDown = false;

	const keyFor = (key: string) => `${prefix}:${encodeURIComponent(key)}`;

	async function redisCommand(command: (string | number)[]): Promise<unknown> {
		const res = await fetchImpl(`${redisUrl}`, {
			method: "POST",
			headers: {
				authorization: `Bearer ${redisToken}`,
				"content-type": "application/json",
			},
			body: JSON.stringify(command),
			signal: AbortSignal.timeout(timeoutMs),
		});
		if (!res.ok) throw new Error(`redis ${res.status}`);
		const body = (await res.json()) as { result?: unknown; error?: string };
		if (body.error) throw new Error(body.error);
		return body.result;
	}

	function store(key: string, serialized: string): void {
		const k = keyFor(key);
		memory.set(k, serialized);
		if (memory.size > 500) memory.clear(); // crude bound; redis persists
		if (redisReady && serialized.length <= maxValueBytes) {
			void redisCommand(["SET", k, serialized, "EX", ttlSec]).catch((err) => {
				if (!warnedRedisDown) {
					warnedRedisDown = true;
					console.warn(`lastKnownGood(${prefix}): redis write failed`, err);
				}
			});
		}
	}

	async function recall(key: string): Promise<string | null> {
		const k = keyFor(key);
		const local = memory.get(k);
		if (local !== undefined) return local;
		if (redisReady) {
			try {
				const result = await redisCommand(["GET", k]);
				if (typeof result === "string") {
					memory.set(k, result);
					return result;
				}
			} catch {
				// a redis blip during an outage is just a miss
			}
		}
		return null;
	}

	return {
		/** true when copies are shared across instances via Redis */
		distributed: redisReady,

		/**
		 * Run the fetcher; on success store the result, on failure serve
		 * the last stored copy. Rethrows the original error only when no
		 * copy has ever been seen.
		 */
		async wrap<T>(key: string, fn: () => Promise<T>): Promise<T> {
			try {
				const value = await fn();
				try {
					store(key, JSON.stringify(value));
				} catch {
					// unserializable values just skip the safety net
				}
				return value;
			} catch (err) {
				const stale = await recall(key);
				if (stale !== null) {
					console.warn(
						`lastKnownGood(${prefix}): serving stored copy for ${key} — live fetch failed:`,
						err instanceof Error ? err.message : err,
					);
					return JSON.parse(stale) as T;
				}
				throw err;
			}
		},
	};
}
