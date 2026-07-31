import { describe, expect, test } from "bun:test";
import { createTtlCache } from "../src/lib/server/ttlCache";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("ttl cache", () => {
	test("fills once and serves the cached value inside the ttl", async () => {
		const cache = createTtlCache<number>({ ttlMs: 1_000 });
		let fills = 0;
		const fill = async () => {
			fills += 1;
			return 42;
		};
		expect(await cache.get("k", fill)).toBe(42);
		expect(await cache.get("k", fill)).toBe(42);
		expect(fills).toBe(1);
	});

	test("concurrent callers share one in-flight fill", async () => {
		const cache = createTtlCache<string>({ ttlMs: 1_000 });
		let fills = 0;
		const fill = async () => {
			fills += 1;
			await sleep(20);
			return "v";
		};
		const [a, b, c] = await Promise.all([
			cache.get("k", fill),
			cache.get("k", fill),
			cache.get("k", fill),
		]);
		expect([a, b, c]).toEqual(["v", "v", "v"]);
		expect(fills).toBe(1);
	});

	test("expires after the ttl and refills", async () => {
		const cache = createTtlCache<number>({ ttlMs: 30 });
		let fills = 0;
		const fill = async () => {
			fills += 1;
			return fills;
		};
		expect(await cache.get("k", fill)).toBe(1);
		await sleep(45);
		expect(await cache.get("k", fill)).toBe(2);
	});

	test("a rejected fill is not cached — the next call retries", async () => {
		const cache = createTtlCache<number>({ ttlMs: 1_000 });
		let fills = 0;
		const fill = async () => {
			fills += 1;
			if (fills === 1) throw new Error("transient");
			return 7;
		};
		await expect(cache.get("k", fill)).rejects.toThrow("transient");
		expect(await cache.get("k", fill)).toBe(7);
		expect(fills).toBe(2);
	});

	test("bounds the entry count, evicting oldest first", async () => {
		const cache = createTtlCache<number>({ ttlMs: 10_000, maxEntries: 3 });
		for (let i = 0; i < 5; i++) {
			await cache.get(`k${i}`, async () => i);
		}
		expect(cache.size()).toBeLessThanOrEqual(3);
		// newest survives
		let fills = 0;
		expect(
			await cache.get("k4", async () => {
				fills += 1;
				return -1;
			}),
		).toBe(4);
		expect(fills).toBe(0);
	});
});
