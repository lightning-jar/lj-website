import { describe, expect, test } from "vitest";
import {
	decide,
	emailSafe,
	lockPackageNames,
	parseSpec,
	type RegistryDoc,
	sameLine,
	setSpec,
} from "../scripts/deps-update";

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.parse("2026-11-10T12:00:00Z");
const ago = (days: number) => new Date(NOW - days * DAY).toISOString();

function doc(
	entries: Record<string, number>,
	deprecated: string[] = [],
): RegistryDoc {
	const versions: RegistryDoc["versions"] = {};
	const time: RegistryDoc["time"] = {};
	for (const [v, days] of Object.entries(entries)) {
		versions[v] = deprecated.includes(v) ? { deprecated: "bad" } : {};
		time[v] = ago(days);
	}
	return { versions, time };
}

describe("deps update: which specs it touches", () => {
	test("exact pins and caret ranges only", () => {
		expect(parseSpec("3.1.0")).toEqual({ prefix: "", version: "3.1.0" });
		expect(parseSpec("^4.0.125")).toEqual({ prefix: "^", version: "4.0.125" });
		for (const s of [
			"~1.2.3",
			">=1",
			"latest",
			"1.2.3-beta.1",
			"workspace:*",
		]) {
			expect(parseSpec(s), s).toBeNull();
		}
	});

	test("same line: same major, and same minor under 0.x", () => {
		expect(sameLine("3.1.0", "3.2.0")).toBe(true);
		expect(sameLine("6.0.3", "7.0.2")).toBe(false);
		expect(sameLine("0.13.0", "0.13.4")).toBe(true);
		expect(sameLine("0.13.0", "0.14.1")).toBe(false);
	});
});

describe("deps update: choosing a target", () => {
	test("takes the newest same-line version at least 7 days old", () => {
		const d = decide(
			"3.1.0",
			doc({ "3.1.0": 30, "3.1.1": 10, "3.2.0": 0.2 }),
			NOW,
		);
		expect(d.target).toBe("3.1.1");
		expect(d.held).toEqual({ version: "3.2.0", reason: "under 7 days old" });
	});

	test("never applies a major; reports it as held", () => {
		const d = decide("6.0.3", doc({ "6.0.3": 60, "7.0.2": 20 }), NOW);
		expect(d.target).toBeNull();
		expect(d.held).toEqual({ version: "7.0.2", reason: "breaking per semver" });
	});

	test("skips prereleases and deprecated versions", () => {
		const d = decide(
			"1.0.0",
			doc({ "1.0.0": 40, "1.1.0": 20, "1.2.0": 15, "2.0.0-rc.1": 10 }, [
				"1.2.0",
			]),
			NOW,
		);
		expect(d.target).toBe("1.1.0");
		expect(d.held).toBeNull();
	});

	test("nothing newer means nothing to do", () => {
		expect(decide("1.0.0", doc({ "1.0.0": 40 }), NOW)).toEqual({
			target: null,
			held: null,
		});
	});
});

describe("deps update: file edits and output", () => {
	test("setSpec swaps one dependency and keeps the layout", () => {
		const pkg =
			'{\n\t"dependencies": {\n\t\t"@sveltejs/kit": "3.1.0",\n\t\t"ai": "^7.0.1"\n\t}\n}\n';
		const out = setSpec(setSpec(pkg, "@sveltejs/kit", "3.1.1"), "ai", "^7.0.9");
		expect(out).toBe(
			'{\n\t"dependencies": {\n\t\t"@sveltejs/kit": "3.1.1",\n\t\t"ai": "^7.0.9"\n\t}\n}\n',
		);
		expect(() => setSpec(pkg, "missing", "1.0.0")).toThrow();
	});

	test("lockPackageNames reads names, including nested and scoped entries", () => {
		const lock = [
			"{",
			'  "packages": {',
			'    "@ai-sdk/gateway": ["@ai-sdk/gateway@4.0.139", "", {}, "sha512-x"],',
			"",
			'    "vite/esbuild": ["esbuild@0.25.0", "", {}, "sha512-y"],',
			"  }",
			"}",
		].join("\n");
		expect([...lockPackageNames(lock)].sort()).toEqual([
			"@ai-sdk/gateway",
			"esbuild",
		]);
	});

	test("lockPackageNames works on the real lockfile", () => {
		const text = require("node:fs").readFileSync(
			`${import.meta.dirname}/../bun.lock`,
			"utf8",
		) as string;
		const names = lockPackageNames(text);
		expect(names.has("@sveltejs/kit")).toBe(true);
		expect(names.size).toBeGreaterThan(200);
	});

	test("email body cannot carry a double quote into the --body flag", () => {
		expect(emailSafe('say "hi"')).toBe("say 'hi'");
		expect(emailSafe("\x1b[31mred\x1b[39m text")).toBe("red text");
	});
});
