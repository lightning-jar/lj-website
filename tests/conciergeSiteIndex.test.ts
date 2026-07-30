import { describe, expect, test } from "bun:test";
// import from the glob-free module directly: agentTools pulls in
// import.meta.glob getters that bun's runtime can't evaluate
import { buildSiteIndex } from "../src/lib/server/siteIndex";

const INPUT = {
	blogArticles: 57,
	readingListEntries: 34,
	packages: [
		{ name: "barkup", id: "barkup" },
		{ name: "barkdown", id: "barkdown" },
		{ name: "woof-editor", id: "woof-editor" },
	],
};

describe("buildSiteIndex (AEO Bench Study 3 curated index)", () => {
	test("is deterministic — byte-identical for the same input", () => {
		// this is the static-block cache-safety guarantee: the string that
		// carries the cacheControl breakpoint must not vary between requests
		expect(buildSiteIndex(INPUT)).toBe(buildSiteIndex(INPUT));
	});

	test("no per-request data (timestamps, ids) leaks into the block", () => {
		const idx = buildSiteIndex(INPUT);
		// a 10+ digit run would be an epoch timestamp or similar leak
		expect(idx).not.toMatch(/\b\d{10,}\b/);
	});

	test("curated size bound — roughly 1.5-2k tokens, not the everything-index", () => {
		const idx = buildSiteIndex(INPUT);
		// ~4 chars/token; stay well under the 2.68x giant-index cost Study 3
		// measured, while carrying the full study list
		expect(idx.length).toBeGreaterThan(1_500);
		expect(idx.length).toBeLessThan(9_000);
	});

	test("study header states the exact total (so the model doesn't estimate)", () => {
		const idx = buildSiteIndex(INPUT);
		// count only per-study lines (project/slug), not the sections line
		// that names the two dashboards
		const studyLines = (idx.match(/\n- \/research\/[\w-]+\/\S/g) ?? []).length;
		expect(studyLines).toBeGreaterThan(0);
		expect(idx).toMatch(new RegExp(`Research studies \\(${studyLines} total;`));
	});

	test("carries the curated pieces: studies, packages, section paths", () => {
		const idx = buildSiteIndex(INPUT);
		expect(idx).toContain("/research/aeo-bench/1");
		expect(idx).toContain("/research/barkup-bench/");
		expect(idx).toContain("barkdown — /packages/barkdown");
		expect(idx).toContain('search_content(collection:"blog")');
		expect(idx).toContain("~57 articles");
		expect(idx).toContain("~34 entries");
	});

	test("is curated, not complete — points at search_content instead of inlining entries", () => {
		const idx = buildSiteIndex(INPUT);
		// the pointer templates are present...
		expect(idx).toContain("/blog/<slug>");
		expect(idx).toContain("/reading-list/<slug>");
		// ...but no actual blog/reading entries are dumped as list items
		expect(idx).not.toMatch(/\n- \/blog\//);
		expect(idx).not.toMatch(/\n- \/reading-list\//);
	});
});
