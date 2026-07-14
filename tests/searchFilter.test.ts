import { describe, expect, it } from "bun:test";
import {
	matchesEveryTerm,
	searchTermsOf,
	toggleSearchTerm,
	uniqueSortedTags,
} from "../src/lib/utils/searchFilter";

describe("searchTermsOf", () => {
	it("lowercases and splits on whitespace, dropping empties", () => {
		expect(searchTermsOf("Svelte  PIM ")).toEqual(["svelte", "pim"]);
		expect(searchTermsOf("")).toEqual([]);
		expect(searchTermsOf("   ")).toEqual([]);
	});
});

describe("matchesEveryTerm", () => {
	const parts = [
		"The Evolution of Replicator",
		"AI document platform",
		"svelte",
	];

	it("requires every term to match somewhere", () => {
		expect(matchesEveryTerm(parts, ["replicator", "svelte"])).toBe(true);
		expect(matchesEveryTerm(parts, ["replicator", "pimcore"])).toBe(false);
	});

	it("matches case-insensitively and passes with no terms", () => {
		expect(matchesEveryTerm(parts, ["EVOLUTION".toLowerCase()])).toBe(true);
		expect(matchesEveryTerm(parts, [])).toBe(true);
	});
});

describe("uniqueSortedTags", () => {
	it("dedupes, flattens, alphabetizes, and tolerates missing lists", () => {
		expect(
			uniqueSortedTags([["svelte", "pim"], undefined, ["ai", "svelte"]]),
		).toEqual(["ai", "pim", "svelte"]);
		expect(uniqueSortedTags([])).toEqual([]);
	});
});

describe("toggleSearchTerm", () => {
	it("adds the tag's term when absent", () => {
		expect(toggleSearchTerm("svelte", "PIM")).toBe("svelte pim");
		expect(toggleSearchTerm("", "svelte")).toBe("svelte");
	});

	it("removes the tag's term when present, keeping other terms", () => {
		expect(toggleSearchTerm("svelte pim", "PIM")).toBe("svelte");
		expect(toggleSearchTerm("svelte", "svelte")).toBe("");
	});
});
