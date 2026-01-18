import { describe, expect, it } from "bun:test";
import {
	getFrontMatter,
	parseMarkdown,
	parseMarkdownTextToHtml,
} from "../src/lib/utils/parseMarkdown";

// Utility to normalize HTML output for comparisons
function normalize(html: string) {
	return html.replace(/\r\n/g, "\n").replace(/\s+/g, " ").trim();
}

describe("getFrontMatter", () => {
	it("parses simple string values", () => {
		const md = `---
title: Hello World
author: "Jane Doe"
draft: 'false'
---
# Heading
`;
		expect(getFrontMatter(md)).toEqual({
			title: "Hello World",
			author: "Jane Doe",
			draft: "false",
		});
	});

	it("returns empty object when no front matter", () => {
		const md = `# Hello`;
		expect(getFrontMatter(md)).toEqual({});
	});

	it("ignores unclosed front matter", () => {
		const md = `---
title: A
# Heading
`;
		expect(getFrontMatter(md)).toEqual({});
	});

	it("supports dots and dashes in keys", () => {
		const md = `---
seo.title: Site
build-number: 42
---
`;
		expect(getFrontMatter(md)).toEqual({
			"seo.title": "Site",
			"build-number": "42",
		});
	});
});

describe("parseMarkdownTextToHtml - blocks", () => {
	it("renders headings correctly", () => {
		const md = `# H1
## H2
###### H6`;
		const html = parseMarkdownTextToHtml({
			markdown: md,
			options: { sanitize: true },
		});
		expect(normalize(html)).toBe(
			normalize(`<h1>H1</h1><h2>H2</h2><h6>H6</h6>`),
		);
	});

	it("groups paragraphs across wrapped lines", () => {
		const md = `First line
continues here.

Second paragraph
spans lines.`;
		const html = parseMarkdownTextToHtml({
			markdown: md,
			options: { sanitize: true },
		});
		expect(normalize(html)).toBe(
			normalize(
				`<p>First line continues here.</p><p>Second paragraph spans lines.</p>`,
			),
		);
	});

	it("handles unordered and ordered lists and switches types", () => {
		const md = `- a
-  b
1. c
2. d

* e`;
		const html = parseMarkdownTextToHtml({
			markdown: md,
			options: { sanitize: true },
		});
		expect(normalize(html)).toBe(
			normalize(
				`<ul><li>a</li><li>b</li></ul><ol><li>c</li><li>d</li></ol><ul><li>e</li></ul>`,
			),
		);
	});

	it("supports fenced code blocks with language", () => {
		const md = "```ts\nconst x = 1 < 2;\n```\n";
		const html = parseMarkdownTextToHtml({
			markdown: md,
			options: { sanitize: true },
		});
		expect(normalize(html)).toBe(
			normalize(
				`<pre><code class="language-ts">const x = 1 &lt; 2;</code></pre>`,
			),
		);
	});

	it("auto-closes unclosed fenced blocks at EOF", () => {
		const md = "```\nabc";
		const html = parseMarkdownTextToHtml({
			markdown: md,
			options: { sanitize: true },
		});
		expect(normalize(html)).toBe(normalize(`<pre><code>abc</code></pre>`));
	});
});

describe("parseMarkdownTextToHtml - inline", () => {
	it("renders inline code with escaping and protects from other transforms", () => {
		const md = "Text with `a < b && **not bold**` inside.";
		const html = parseMarkdownTextToHtml({
			markdown: md,
			options: { sanitize: true },
		});
		expect(normalize(html)).toBe(
			normalize(
				`<p>Text with <code>a &lt; b &amp;&amp; **not bold**</code> inside.</p>`,
			),
		);
	});

	it("renders bold and italic", () => {
		const md = "This is **bold** and *italic*.";
		const html = parseMarkdownTextToHtml({
			markdown: md,
			options: { sanitize: true },
		});
		expect(normalize(html)).toBe(
			normalize(`<p>This is <strong>bold</strong> and <em>italic</em>.</p>`),
		);
	});

	it("renders images without wrapping <p> when alone", () => {
		const md = "![alt](img.png)";
		const html = parseMarkdownTextToHtml({
			markdown: md,
			options: { sanitize: true, lazyImages: true },
		});
		expect(normalize(html)).toBe(
			normalize(
				`<img loading="lazy" class="w-full h-auto rounded overflow-hidden mb-5" src="img.png" alt="alt">`,
			),
		);
	});

	it("renders links with title", () => {
		const md = `[Open](https://example.com "Example")`;
		const html = parseMarkdownTextToHtml({
			markdown: md,
			options: { sanitize: true },
		});
		expect(normalize(html)).toBe(
			normalize(
				`<p><a href="https://example.com" title="Example">Open</a></p>`,
			),
		);
	});

	it("autolinks bare URLs", () => {
		const md = `Visit https://example.com/test?q=1.`;
		const html = parseMarkdownTextToHtml({
			markdown: md,
			options: { sanitize: true },
		});
		expect(normalize(html)).toBe(
			normalize(
				`<p>Visit <a href="https://example.com/test?q=1" rel="noopener noreferrer" target="_blank">https://example.com/test?q=1</a>.</p>`,
			),
		);
	});
});

describe("parseMarkdown - integration", () => {
	it("extracts front matter and strips it from the HTML", () => {
		const md = `---
title: Hello
---
# H
Paragraph.`;
		const out = parseMarkdown(md);
		expect(out.frontMatter).toEqual({ title: "Hello" });
		expect(normalize(out.html)).toBe(normalize(`<h1>H</h1><p>Paragraph.</p>`));
	});

	it("does not remove later thematic breaks", () => {
		const md = `---
title: A
---
Paragraph
---
Another`;
		const out = parseMarkdown(md);
		expect(out.frontMatter).toEqual({ title: "A" });
		// After the first block, '---' is just text for this simplified parser
		expect(normalize(out.html)).toContain("Paragraph");
	});

	it("sanitizes HTML input", () => {
		const md = `Hello <script>alert(1)</script>`;
		const out = parseMarkdown(md);
		expect(out.frontMatter).toEqual({});
		expect(normalize(out.html)).toBe(
			normalize(`<p>Hello &lt;script&gt;alert(1)&lt;/script&gt;</p>`),
		);
	});
});
