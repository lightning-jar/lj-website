import { describe, expect, test } from "bun:test";

import {
	agentMarkdownRouteFor,
	blogMarkdownDoc,
	estimateTokens,
	markdownResponse,
	readingListMarkdownDoc,
	storyMarkdownDoc,
} from "../src/lib/utils/agentMarkdown";

describe("agentMarkdownRouteFor", () => {
	test("matches the three article routes", () => {
		expect(agentMarkdownRouteFor("/blog/leaving-wordpress")).toEqual({
			type: "blog",
			slug: "leaving-wordpress",
		});
		expect(agentMarkdownRouteFor("/customer-stories/securelogix")).toEqual({
			type: "customer-story",
			slug: "securelogix",
		});
		expect(agentMarkdownRouteFor("/reading-list/overtraining")).toEqual({
			type: "reading-list",
			slug: "overtraining",
		});
	});

	test("ignores landings, feeds, previews, and other routes", () => {
		expect(agentMarkdownRouteFor("/blog")).toBeUndefined();
		expect(agentMarkdownRouteFor("/blog/atom.xml")).toBeUndefined();
		expect(agentMarkdownRouteFor("/blog/preview/token123")).toBeUndefined();
		expect(agentMarkdownRouteFor("/research/barkup-bench/aa")).toBeUndefined();
		expect(agentMarkdownRouteFor("/")).toBeUndefined();
	});
});

describe("markdown docs", () => {
	test("blog doc carries frontmatter, title heading, and body", () => {
		const doc = blogMarkdownDoc({
			title: "Leaving WordPress",
			date: "2024-01-01",
			author: "Kevin Peckham",
			tags: ["CMS"],
			url: "https://www.lightningjar.com/blog/leaving-wordpress",
			markdown: "Body text.",
		});
		expect(doc).toStartWith("---\n");
		expect(doc).toContain("title: Leaving WordPress");
		expect(doc).toContain('tags: ["CMS"]');
		expect(doc).toContain(
			"canonical: https://www.lightningjar.com/blog/leaving-wordpress",
		);
		expect(doc).toContain("# Leaving WordPress\n\nBody text.");
		// undefined fields are dropped, not serialized
		expect(doc).not.toContain("undefined");
	});

	test("story doc includes customer", () => {
		const doc = storyMarkdownDoc({
			title: "Ten Years",
			customer: "SecureLogix",
			url: "https://example.com/customer-stories/x",
			markdown: "Story body.",
		});
		expect(doc).toContain("customer: SecureLogix");
		expect(doc).toContain("# Ten Years");
	});

	test("reading-list doc is metadata-only with attribution and source", () => {
		const doc = readingListMarkdownDoc({
			title: "Overtraining",
			author: "Sean Goedecke",
			publication: "seangoedecke.com",
			summary: "A summary.",
			sourceUrl: "https://example.com/original",
			url: "https://www.lightningjar.com/reading-list/overtraining",
		});
		expect(doc).toContain("# Overtraining");
		expect(doc).toContain("By Sean Goedecke, seangoedecke.com.");
		expect(doc).toContain("Read the original: https://example.com/original");
	});
});

describe("markdownResponse", () => {
	test("sets media type, vary, and token estimate", async () => {
		const res = markdownResponse("# Hi\n\nFour chars make one token-ish.");
		expect(res.headers.get("content-type")).toBe(
			"text/markdown; charset=utf-8",
		);
		expect(res.headers.get("vary")).toBe("Accept");
		const tokens = Number(res.headers.get("x-markdown-tokens"));
		expect(tokens).toBe(estimateTokens(await res.text()));
		expect(tokens).toBeGreaterThan(0);
	});
});
