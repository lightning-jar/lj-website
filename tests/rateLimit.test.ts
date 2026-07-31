import { describe, expect, test } from "bun:test";
import { createRateLimiter } from "../src/lib/server/rateLimit";

const RULES = [
	{ name: "ip5m", max: 3, windowSec: 300, scope: "ip" as const },
	{ name: "daily", max: 10, windowSec: 86_400, scope: "global" as const },
];

describe("rate limiter — in-memory mode (no redis configured)", () => {
	test("allows under the per-ip limit, blocks over it", async () => {
		const limiter = createRateLimiter({ prefix: "t", rules: RULES });
		expect(limiter.distributed).toBe(false);
		for (let i = 0; i < 3; i++) {
			expect((await limiter.check("1.2.3.4")).ok).toBe(true);
		}
		const blocked = await limiter.check("1.2.3.4");
		expect(blocked.ok).toBe(false);
		if (!blocked.ok) {
			expect(blocked.rule).toBe("ip5m");
			expect(blocked.retryAfterSec).toBeGreaterThan(0);
			expect(blocked.retryAfterSec).toBeLessThanOrEqual(300);
		}
	});

	test("per-ip limits are independent across ips", async () => {
		const limiter = createRateLimiter({ prefix: "t", rules: RULES });
		for (let i = 0; i < 3; i++) await limiter.check("1.1.1.1");
		expect((await limiter.check("1.1.1.1")).ok).toBe(false);
		expect((await limiter.check("2.2.2.2")).ok).toBe(true);
	});

	test("global rule counts every caller", async () => {
		const limiter = createRateLimiter({
			prefix: "t",
			rules: [{ name: "daily", max: 4, windowSec: 86_400, scope: "global" }],
		});
		for (let i = 0; i < 4; i++) {
			expect((await limiter.check(`ip-${i}`)).ok).toBe(true);
		}
		const blocked = await limiter.check("ip-fresh");
		expect(blocked.ok).toBe(false);
		if (!blocked.ok) expect(blocked.rule).toBe("daily");
	});
});

describe("rate limiter — redis mode (mocked upstash pipeline)", () => {
	function mockRedis(counts: () => number[]) {
		const calls: (string | number)[][][] = [];
		const fetchImpl = (async (_url: unknown, init?: RequestInit) => {
			const body = JSON.parse(String(init?.body)) as (string | number)[][];
			calls.push(body);
			// respond to INCR/EXPIRE pairs: [incr result, expire result, ...]
			const results = counts().flatMap((n) => [{ result: n }, { result: 1 }]);
			return new Response(JSON.stringify(results), { status: 200 });
		}) as typeof globalThis.fetch;
		return { fetchImpl, calls };
	}

	test("uses the pipeline verdict: under limit passes, over limit blocks", async () => {
		let hit = 0;
		const { fetchImpl, calls } = mockRedis(() => {
			hit += 1;
			return [hit, hit]; // both rules see the same count
		});
		const limiter = createRateLimiter({
			prefix: "t",
			rules: RULES,
			redisUrl: "https://fake.upstash.io",
			redisToken: "tok",
			fetchImpl,
		});
		expect(limiter.distributed).toBe(true);
		for (let i = 0; i < 3; i++) {
			expect((await limiter.check("9.9.9.9")).ok).toBe(true);
		}
		const blocked = await limiter.check("9.9.9.9");
		expect(blocked.ok).toBe(false);
		if (!blocked.ok) expect(blocked.rule).toBe("ip5m");
		// one pipeline round-trip per check, two commands per rule
		expect(calls.length).toBe(4);
		expect(calls[0].length).toBe(RULES.length * 2);
		expect(calls[0][0][0]).toBe("INCR");
		expect(calls[0][1][0]).toBe("EXPIRE");
	});

	test("falls back to in-memory counters when redis errors", async () => {
		const failing = (async () => {
			throw new Error("boom");
		}) as unknown as typeof globalThis.fetch;
		const limiter = createRateLimiter({
			prefix: "t",
			rules: [{ name: "ip", max: 2, windowSec: 300, scope: "ip" }],
			redisUrl: "https://fake.upstash.io",
			redisToken: "tok",
			fetchImpl: failing,
		});
		// memory fallback still enforces the fence
		expect((await limiter.check("3.3.3.3")).ok).toBe(true);
		expect((await limiter.check("3.3.3.3")).ok).toBe(true);
		expect((await limiter.check("3.3.3.3")).ok).toBe(false);
	});
});
