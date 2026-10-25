import { describe, expect, test } from "vitest";
import { isRepoScriptPath, splitArgs } from "../src/lib/utils/shellArgs";

describe("isRepoScriptPath", () => {
	test("accepts scripts/<name>.ts", () => {
		expect(isRepoScriptPath("scripts/env-audit.ts")).toBe(true);
		expect(isRepoScriptPath("scripts/notify-ops-failure.ts")).toBe(true);
		expect(isRepoScriptPath("scripts/db_copy.v2.ts")).toBe(true);
	});

	test("rejects traversal, subdirectories, other extensions and shell metacharacters", () => {
		for (const bad of [
			"",
			"scripts/../src/lib/auth.ts",
			"scripts/nested/x.ts",
			"scripts/x.js",
			"/etc/passwd",
			"scripts/x.ts; rm -rf /",
			"scripts/x.ts && curl evil",
			"scripts/$(whoami).ts",
		]) {
			expect(isRepoScriptPath(bad)).toBe(false);
		}
	});
});

describe("splitArgs", () => {
	test("splits on whitespace", () => {
		expect(splitArgs("--dry-run --envs=dev,stage")).toEqual([
			"--dry-run",
			"--envs=dev,stage",
		]);
	});

	test("keeps double-quoted spans together and drops the quotes", () => {
		expect(splitArgs('--subject="a b" --body="c d e"')).toEqual([
			"--subject=a b",
			"--body=c d e",
		]);
	});

	test("treats shell metacharacters as ordinary characters", () => {
		expect(splitArgs('--body="x; rm -rf / | $(id) `id`"')).toEqual([
			"--body=x; rm -rf / | $(id) `id`",
		]);
	});

	test("empty input yields no arguments", () => {
		expect(splitArgs("")).toEqual([]);
		expect(splitArgs("   ")).toEqual([]);
	});

	test("throws on an unterminated quote", () => {
		expect(() => splitArgs('--body="unclosed')).toThrow(
			/unterminated double quote/,
		);
	});
});
