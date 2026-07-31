// Random selection helpers (client-side UI sugar; not for anything
// that needs cryptographic or seeded randomness).

export function randomInt(min: number, max: number): number {
	// Ceil/floor so fractional bounds still yield an integer in range
	const lo = Math.ceil(min);
	const hi = Math.floor(max);

	// +1 makes the upper bound inclusive
	return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

export function pickRandom<T>(items: T[], count = 3): T[] {
	const pool = [...items]; // copy so we don't mutate the caller's array
	const picked: T[] = [];

	// Clamp so we never try to draw more items than exist
	const total = Math.min(count, pool.length);

	for (let i = 0; i < total; i++) {
		// Pick from the remaining (unpicked) portion of the pool
		const index = randomInt(0, pool.length - 1);

		// splice removes it from the pool, guaranteeing distinct results
		picked.push(pool.splice(index, 1)[0]);
	}

	return picked;
}
