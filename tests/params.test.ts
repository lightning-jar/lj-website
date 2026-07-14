import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
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

// The slug matcher gates every /blog/[slug] and /customer-stories/[slug]
// request: a content slug that fails it 404s in production. Drafts are
// included since they publish eventually.
describe("content slugs satisfy the slug matcher", () => {
	const contentDir = join(import.meta.dir, "../src/lib/content");

	it("every blog article slug is kebab-case", () => {
		const dir = join(contentDir, "blog");
		const files = readdirSync(dir).filter((f) => f.endsWith(".md"));
		expect(files.length).toBeGreaterThan(0);
		for (const file of files) {
			const source = readFileSync(join(dir, file), "utf8");
			const slug = source.match(/^slug:\s*(\S+)\s*$/m)?.[1];
			expect(slug, `${file} has no slug in frontmatter`).toBeDefined();
			expect(matchSlug(slug as string), `${file}: "${slug}"`).toBe(true);
		}
	});

	it("every customer story slug is kebab-case", () => {
		const dir = join(contentDir, "customer-stories");
		const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
		expect(files.length).toBeGreaterThan(0);
		for (const file of files) {
			const story = JSON.parse(readFileSync(join(dir, file), "utf8"));
			expect(typeof story.slug, `${file} has no slug`).toBe("string");
			expect(matchSlug(story.slug), `${file}: "${story.slug}"`).toBe(true);
		}
	});
});
