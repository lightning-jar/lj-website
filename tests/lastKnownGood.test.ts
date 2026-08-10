import { describe, expect, test } from "bun:test";
import { createLastKnownGood } from "../src/lib/server/lastKnownGood";

describe("last-known-good — in-memory mode", () => {
	test("success passes through and is stored", async () => {
		const lkg = createLastKnownGood({ prefix: "t" });
		const value = await lkg.wrap("k", async () => ({ n: 1 }));
		expect(value).toEqual({ n: 1 });
	});

	test("failure serves the last stored copy", async () => {
		const lkg = createLastKnownGood({ prefix: "t" });
		await lkg.wrap("k", async () => ({ articles: ["a", "b"] }));
		const stale = await lkg.wrap<{ articles: string[] }>("k", async () => {
			throw new Error("CMS down");
		});
		expect(stale).toEqual({ articles: ["a", "b"] });
	});

	test("failure with no stored copy rethrows the original error", async () => {
		const lkg = createLastKnownGood({ prefix: "t" });
		await expect(
			lkg.wrap("never-seen", async () => {
				throw new Error("CMS down");
			}),
		).rejects.toThrow("CMS down");
	});

	test("a later success refreshes the stored copy", async () => {
		const lkg = createLastKnownGood({ prefix: "t" });
		await lkg.wrap("k", async () => "v1");
		await lkg.wrap("k", async () => "v2");
		const stale = await lkg.wrap<string>("k", async () => {
			throw new Error("down");
		});
		expect(stale).toBe("v2");
	});

	test("keys are independent", async () => {
		const lkg = createLastKnownGood({ prefix: "t" });
		await lkg.wrap("a", async () => 1);
		await expect(
			lkg.wrap("b", async () => {
				throw new Error("down");
			}),
		).rejects.toThrow();
	});
});

describe("last-known-good — redis mode (mocked upstash)", () => {
	function mockRedis() {
		const store = new Map<string, string>();
		const commands: (string | number)[][] = [];
		const fetchImpl = (async (_url: unknown, init?: RequestInit) => {
			const cmd = JSON.parse(String(init?.body)) as (string | number)[];
			commands.push(cmd);
			if (cmd[0] === "SET") {
				store.set(String(cmd[1]), String(cmd[2]));
				return new Response(JSON.stringify({ result: "OK" }));
			}
			if (cmd[0] === "GET")
				return new Response(
					JSON.stringify({ result: store.get(String(cmd[1])) ?? null }),
				);
			return new Response(JSON.stringify({ error: "unexpected" }), {
				status: 400,
			});
		}) as typeof globalThis.fetch;
		return { fetchImpl, store, commands };
	}

	const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

	test("successes write through; a cold instance recovers from redis", async () => {
		const redis = mockRedis();
		const warm = createLastKnownGood({
			prefix: "t",
			redisUrl: "https://fake.upstash.io",
			redisToken: "tok",
			fetchImpl: redis.fetchImpl,
		});
		await warm.wrap("list", async () => ({ articles: [1, 2, 3] }));
		await sleep(10); // fire-and-forget write

		// a different instance (fresh memory) with the same redis
		const cold = createLastKnownGood({
			prefix: "t",
			redisUrl: "https://fake.upstash.io",
			redisToken: "tok",
			fetchImpl: redis.fetchImpl,
		});
		const recovered = await cold.wrap<{ articles: number[] }>(
			"list",
			async () => {
				throw new Error("CMS down");
			},
		);
		expect(recovered).toEqual({ articles: [1, 2, 3] });
	});

	test("oversized values are not written to redis", async () => {
		const redis = mockRedis();
		const lkg = createLastKnownGood({
			prefix: "t",
			redisUrl: "https://fake.upstash.io",
			redisToken: "tok",
			fetchImpl: redis.fetchImpl,
			maxValueBytes: 50,
		});
		await lkg.wrap("big", async () => "x".repeat(200));
		await sleep(10);
		expect(redis.commands.some((c) => c[0] === "SET")).toBe(false);
		// but the in-memory copy still serves
		const stale = await lkg.wrap<string>("big", async () => {
			throw new Error("down");
		});
		expect(stale).toBe("x".repeat(200));
	});
});
