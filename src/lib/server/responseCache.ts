// Response cache for the concierge's suggested prompts: the chip
// prompts are fixed strings, so a first-turn chip conversation is
// byte-identical across visitors — serve the stored answer instantly
// instead of re-running the model (the win is 3-6s of stream latency;
// it also degrades gracefully if the gateway is down). Upstash-backed
// when configured so the cache is shared across instances; in-memory
// per-instance otherwise. Config is injected (no env reads) so bun
// tests can exercise both modes.

interface MemoryEntry {
	value: string;
	expiresAt: number;
}

export interface ResponseCacheConfig {
	/** key prefix, e.g. "cc:v1" */
	prefix: string;
	ttlSec: number;
	/** Upstash REST endpoint; memory-only when absent */
	redisUrl?: string;
	redisToken?: string;
	/** injected for tests; defaults to global fetch */
	fetchImpl?: typeof globalThis.fetch;
	/** Redis round-trip budget before treating a get as a miss */
	timeoutMs?: number;
}

export function createResponseCache(config: ResponseCacheConfig) {
	const {
		prefix,
		ttlSec,
		redisUrl,
		redisToken,
		fetchImpl = globalThis.fetch,
		timeoutMs = 500,
	} = config;
	const redisReady = Boolean(redisUrl && redisToken);
	const memory = new Map<string, MemoryEntry>();

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

	return {
		/** true when the cache is shared across instances via Redis */
		distributed: redisReady,

		/** stored value, or null on miss / expiry / redis trouble */
		async get(key: string): Promise<string | null> {
			const k = keyFor(key);
			if (redisReady) {
				try {
					const result = await redisCommand(["GET", k]);
					return typeof result === "string" ? result : null;
				} catch {
					// fall through to memory — a redis blip is just a miss
				}
			}
			const hit = memory.get(k);
			if (!hit) return null;
			if (hit.expiresAt <= Date.now()) {
				memory.delete(k);
				return null;
			}
			return hit.value;
		},

		/** fire-and-forget store; never throws into the caller */
		set(key: string, value: string): void {
			const k = keyFor(key);
			memory.set(k, { value, expiresAt: Date.now() + ttlSec * 1000 });
			if (memory.size > 100) memory.clear(); // small bound; allowlist is tiny
			if (redisReady) {
				void redisCommand(["SET", k, value, "EX", ttlSec]).catch(() => {});
			}
		},
	};
}
