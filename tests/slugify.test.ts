import { describe, expect, it } from "bun:test";
import slugify, { type SlugifyOptions } from "../src/lib/utils/slugify"; // adjust path

describe("slugify", () => {
	it("returns empty string by default for nullish or empty input", () => {
		expect(slugify(null)).toBe("");
		expect(slugify(undefined)).toBe("");
		expect(slugify("")).toBe("");
	});

	it("uses def when input is nullish or empty string", () => {
		const opts: SlugifyOptions = { def: "default" };
		expect(slugify(null, opts)).toBe("default");
		expect(slugify(undefined, opts)).toBe("default");
		expect(slugify("", opts)).toBe("default");
	});

	it("lowercases input and keeps only a-z and 0-9", () => {
		expect(slugify("Hello WORLD 123")).toBe("hello-world-123");
		expect(slugify("A_Z a_z 0-9")).toBe("a-z-a-z-0-9"); // underscores become separators
		expect(slugify("MiXeD-CASE_and.SPACES")).toBe("mixed-case-and-spaces");
	});

	it("collapses consecutive non-alnum into single separator", () => {
		expect(slugify("a---b")).toBe("a-b");
		expect(slugify("a__b")).toBe("a-b");
		expect(slugify("a   b")).toBe("a-b");
		expect(slugify("a***b%%%c")).toBe("a-b-c");
	});

	it("trims leading/trailing separators generated from non-alnum edges", () => {
		expect(slugify("---hello---")).toBe("hello");
		expect(slugify("__hello__")).toBe("hello");
		expect(slugify("   hello   ")).toBe("hello");
	});

	it("handles custom separator", () => {
		expect(slugify("hello world", { separator: "_" })).toBe("hello_world");
		expect(slugify("a---b", { separator: "." })).toBe("a.b");
		expect(slugify("  a  b  c  ", { separator: ":" })).toBe("a:b:c");
	});

	it("respects maxLength before processing", () => {
		const input = "Hello, World! 12345";
		// limit causes slicing before normalization/lowercasing
		// "Hello, Wor" (length 11) -> "hello--wor" -> "hello-wor"
		expect(slugify(input, { maxLength: 11 })).toBe("hello-worl");

		// if maxLength cuts in the middle of a token, separator logic still applies
		// "Hello, World!" -> lower -> "hello, world!"
		// slice(0, 5) => "hello" => "hello"
		expect(slugify("Hello, World!", { maxLength: 5 })).toBe("hello");
	});

	it("returns def when result becomes empty after filtering", () => {
		expect(slugify("!!!")).toBe(""); // default def = ""
		expect(slugify("###", { def: "none" })).toBe("none");
		expect(slugify("   ", { def: "blank" })).toBe("blank");
		expect(slugify("$$$$", { def: null })).toBe(""); // def can be null, default fallback is ""
	});

	it("coerces numbers to string and slugifies", () => {
		expect(slugify(0)).toBe("0");
		expect(slugify(1234567890)).toBe("1234567890");
		expect(slugify(12_345)).toBe("12345");
	});

	it("handles Unicode by dropping diacritics and treating non-ASCII as separators", () => {
		expect(slugify("café déjà vu")).toBe("cafe-deja-vu");
		expect(slugify("你好，世界")).toBe(""); // becomes empty -> default ""
		expect(slugify("Привет-мир", { def: "x" })).toBe("x");
		expect(slugify("naïve façade coöperate")).toBe("naive-facade-cooperate");
	});

	it("does not emit duplicate separators at start/end or consecutively", () => {
		expect(slugify("--a--b--")).toBe("a-b");
		expect(slugify("..a..b..")).toBe("a-b");
		expect(slugify("__a__b__", { separator: "_" })).toBe("a_b");
	});

	it("large inputs are sliced to maxLength and still valid", () => {
		const long = "A".repeat(300);
		// lowercased to 'a' repeated, sliced to 255, no separators needed
		expect(slugify(long)).toBe("a".repeat(255));
	});

	it("separator can be multi-character", () => {
		expect(slugify("a b c", { separator: "--" })).toBe("a--b--c");
		expect(slugify(" a  b  ", { separator: "::" })).toBe("a::b");
	});

	it("handles mixture of symbols ensuring single separator output", () => {
		expect(slugify("a@@@###$$$%%%^^^b")).toBe("a-b");
		expect(slugify("a\tb\nc")).toBe("a-b-c");
	});

	it("works when options object includes unknown keys", () => {
		const opts = { separator: "+", unknown: 123 } as SlugifyOptions;
		expect(slugify("a b c", opts)).toBe("a+b+c");
	});
});
