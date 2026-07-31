import { describe, expect, test } from "bun:test";
import { pickRandom, randomInt } from "../src/lib/utils/pickRandom";

describe("randomInt", () => {
	test("stays inside inclusive bounds", () => {
		for (let i = 0; i < 200; i++) {
			const n = randomInt(2, 5);
			expect(n).toBeGreaterThanOrEqual(2);
			expect(n).toBeLessThanOrEqual(5);
			expect(Number.isInteger(n)).toBe(true);
		}
	});

	test("degenerate range returns the single value", () => {
		expect(randomInt(3, 3)).toBe(3);
	});
});

describe("pickRandom", () => {
	const items = ["a", "b", "c", "d", "e"];

	test("returns the requested count of distinct items", () => {
		for (let i = 0; i < 50; i++) {
			const picked = pickRandom(items, 3);
			expect(picked.length).toBe(3);
			expect(new Set(picked).size).toBe(3);
			for (const p of picked) expect(items).toContain(p);
		}
	});

	test("clamps when asking for more than exist", () => {
		const picked = pickRandom(items, 99);
		expect(picked.length).toBe(items.length);
		expect(new Set(picked).size).toBe(items.length);
	});

	test("does not mutate the input array", () => {
		const input = [1, 2, 3];
		pickRandom(input, 2);
		expect(input).toEqual([1, 2, 3]);
	});
});
