import { describe, expect, it } from "bun:test";
import { match as matchNotFile } from "../src/params/notfile";
import { match as matchSlug } from "../src/params/slug";

describe("slug matcher", () => {
	it("accepts kebab-case slugs", () => {
		expect(matchSlug("undo-that")).toBe(true);
		expect(matchSlug("barkup-0-2-anchored-patches")).toBe(true);
		expect(matchSlug("a")).toBe(true);
		expect(matchSlug("25-years")).toBe(true);
	});

	it("rejects file-like and malformed params", () => {
		expect(matchSlug("atom.xml")).toBe(false);
		expect(matchSlug("sitemap.xml")).toBe(false);
		expect(matchSlug("")).toBe(false);
		expect(matchSlug("Uppercase-Slug")).toBe(false);
		expect(matchSlug("under_score")).toBe(false);
		expect(matchSlug("-leading-hyphen")).toBe(false);
		expect(matchSlug("trailing-hyphen-")).toBe(false);
		expect(matchSlug("double--hyphen")).toBe(false);
		expect(matchSlug("has space")).toBe(false);
	});
});

describe("notfile matcher", () => {
	it("accepts page-like paths so the 404 catch-all can render", () => {
		expect(matchNotFile("no-such-page")).toBe(true);
		expect(matchNotFile("some/missing/page")).toBe(true);
		expect(matchNotFile("")).toBe(true);
	});

	it("rejects file-like paths so endpoints fall through to the server", () => {
		expect(matchNotFile("sitemap.xml")).toBe(false);
		expect(matchNotFile("atom.xml")).toBe(false);
		expect(matchNotFile("blog/atom.xml")).toBe(false);
		expect(matchNotFile("robots.txt")).toBe(false);
		expect(matchNotFile("deep/path/to/file.json")).toBe(false);
	});

	it("only inspects the final segment", () => {
		expect(matchNotFile("v1.2/page")).toBe(true);
	});
});

// NOTE: this file used to also verify that every committed blog/customer-
// story slug satisfied the matcher. That content now lives in the
// replicator CMS, so slug discipline is an authoring-time concern there:
// a published slug that isn't kebab-case (e.g. an unedited generated
// `blog-{nanoid}` slug containing uppercase or underscores) will 404 on
// this site because the matcher gates /blog/[slug] and
// /customer-stories/[slug].
