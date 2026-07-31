// Tiny async TTL memo for in-instance caching of CMS fetches (the
// agent surfaces' quiet cost lever: a burst of tool calls should hit
// the CMS once, not once per call). Pure and env-free so bun tests can
// import it directly.
//
// Semantics:
// - concurrent callers share one in-flight promise (dedupe)
// - a rejected promise is evicted immediately, so failures retry
// - entries expire ttlMs after the fill STARTED (simple, predictable)
// - the map is size-bounded with oldest-first eviction

interface Entry<T> {
	value: Promise<T>;
	expiresAt: number;
}

export function createTtlCache<T>(opts: {
	ttlMs: number;
	maxEntries?: number;
}) {
	const { ttlMs, maxEntries = 500 } = opts;
	const store = new Map<string, Entry<T>>();

	function get(key: string, fill: () => Promise<T>): Promise<T> {
		const now = Date.now();
		const hit = store.get(key);
		if (hit && hit.expiresAt > now) return hit.value;

		const value = fill();
		store.set(key, { value, expiresAt: now + ttlMs });
		// evict on rejection so a transient failure is not cached for the TTL
		value.catch(() => {
			if (store.get(key)?.value === value) store.delete(key);
		});

		if (store.size > maxEntries) {
			// Map preserves insertion order; drop the oldest entries
			for (const k of store.keys()) {
				if (store.size <= maxEntries) break;
				store.delete(k);
			}
		}
		return value;
	}

	return { get, size: () => store.size, clear: () => store.clear() };
}
