import { describe, expect, test } from "bun:test";
import { createResponseCache } from "../src/lib/server/responseCache";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("response cache — in-memory mode", () => {
	test("miss, set, hit round-trip", async () => {
		const cache = createResponseCache({ prefix: "t", ttlSec: 60 });
		expect(cache.distributed).toBe(false);
		expect(await cache.get("q1")).toBeNull();
		cache.set("q1", "answer one");
		expect(await cache.get("q1")).toBe("answer one");
	});

	test("expires after the ttl", async () => {
		const cache = createResponseCache({ prefix: "t", ttlSec: 0.05 });
		cache.set("q", "soon gone");
		expect(await cache.get("q")).toBe("soon gone");
		await sleep(80);
		expect(await cache.get("q")).toBeNull();
	});

	test("keys are independent", async () => {
		const cache = createResponseCache({ prefix: "t", ttlSec: 60 });
		cache.set("a", "1");
		cache.set("b", "2");
		expect(await cache.get("a")).toBe("1");
		expect(await cache.get("b")).toBe("2");
	});
});

describe("response cache — redis mode (mocked upstash)", () => {
	test("GET hits redis; SET writes with EX ttl; errors degrade to miss", async () => {
		const commands: (string | number)[][] = [];
		const store = new Map<string, string>();
		const fetchImpl = (async (_url: unknown, init?: RequestInit) => {
			const cmd = JSON.parse(String(init?.body)) as (string | number)[];
			commands.push(cmd);
			if (cmd[0] === "GET")
				return new Response(
					JSON.stringify({ result: store.get(String(cmd[1])) ?? null }),
				);
			if (cmd[0] === "SET") {
				store.set(String(cmd[1]), String(cmd[2]));
				return new Response(JSON.stringify({ result: "OK" }));
			}
			return new Response(JSON.stringify({ error: "unexpected" }), {
				status: 400,
			});
		}) as typeof globalThis.fetch;

		const cache = createResponseCache({
			prefix: "t",
			ttlSec: 3600,
			redisUrl: "https://fake.upstash.io",
			redisToken: "tok",
			fetchImpl,
		});
		expect(cache.distributed).toBe(true);
		expect(await cache.get("prompt")).toBeNull();
		cache.set("prompt", "cached answer");
		await sleep(10); // fire-and-forget SET
		expect(await cache.get("prompt")).toBe("cached answer");

		const setCmd = commands.find((c) => c[0] === "SET");
		expect(setCmd?.[3]).toBe("EX");
		expect(setCmd?.[4]).toBe(3600);
	});

	test("redis failure on get degrades to the memory copy", async () => {
		const failing = (async () => {
			throw new Error("boom");
		}) as unknown as typeof globalThis.fetch;
		const cache = createResponseCache({
			prefix: "t",
			ttlSec: 60,
			redisUrl: "https://fake.upstash.io",
			redisToken: "tok",
			fetchImpl: failing,
		});
		cache.set("q", "local copy");
		expect(await cache.get("q")).toBe("local copy");
	});
});
