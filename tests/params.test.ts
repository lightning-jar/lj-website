import { describe, expect, it } from "vitest";
import { params } from "../src/params";

// SvelteKit 3 matchers are Standard Schemas built by defineParams(), and a
// matcher "declines" a param by producing issues rather than returning
// false. Exercise them exactly the way the router does, so these tests
// keep tracking real routing behaviour.
type Matcher = (typeof params)[keyof typeof params];

function match(matcher: Matcher, value: string): string | undefined {
	const result = matcher["~standard"].validate(value);
	if (result instanceof Promise) throw new Error("matchers must be sync");
	return "issues" in result && result.issues
		? undefined
		: (result as { value: string }).value;
}

describe("slug matcher", () => {
	it("accepts kebab-case slugs", () => {
		expect(match(params.slug, "undo-that")).toBe("undo-that");
		expect(match(params.slug, "barkup-0-2-anchored-patches")).toBe(
			"barkup-0-2-anchored-patches",
		);
		expect(match(params.slug, "a")).toBe("a");
		expect(match(params.slug, "25-years")).toBe("25-years");
	});

	it("rejects file-like and malformed params", () => {
		expect(match(params.slug, "atom.xml")).toBeUndefined();
		expect(match(params.slug, "sitemap.xml")).toBeUndefined();
		expect(match(params.slug, "")).toBeUndefined();
		expect(match(params.slug, "Uppercase-Slug")).toBeUndefined();
		expect(match(params.slug, "under_score")).toBeUndefined();
		expect(match(params.slug, "-leading-hyphen")).toBeUndefined();
		expect(match(params.slug, "trailing-hyphen-")).toBeUndefined();
		expect(match(params.slug, "double--hyphen")).toBeUndefined();
		expect(match(params.slug, "has space")).toBeUndefined();
	});
});

describe("notfile matcher", () => {
	it("accepts page-like paths so the 404 catch-all can render", () => {
		expect(match(params.notfile, "no-such-page")).toBe("no-such-page");
		expect(match(params.notfile, "some/missing/page")).toBe(
			"some/missing/page",
		);
		// an empty rest param is still a match (the matcher runs with "")
		expect(match(params.notfile, "")).toBe("");
	});

	it("rejects file-like paths so endpoints fall through to the server", () => {
		expect(match(params.notfile, "sitemap.xml")).toBeUndefined();
		expect(match(params.notfile, "atom.xml")).toBeUndefined();
		expect(match(params.notfile, "blog/atom.xml")).toBeUndefined();
		expect(match(params.notfile, "robots.txt")).toBeUndefined();
		expect(match(params.notfile, "deep/path/to/file.json")).toBeUndefined();
	});

	it("only inspects the final segment", () => {
		expect(match(params.notfile, "v1.2/page")).toBe("v1.2/page");
	});
});

// NOTE: this file used to also verify that every committed blog/customer-
// story slug satisfied the matcher. That content now lives in the
// replicator CMS, so slug discipline is an authoring-time concern there:
// a published slug that isn't kebab-case (e.g. an unedited generated
// `blog-{nanoid}` slug containing uppercase or underscores) will 404 on
// this site because the matcher gates /blog/[slug] and
// /customer-stories/[slug].
