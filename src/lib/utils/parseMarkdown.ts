/**
 * Markdown → HTML for site content.
 *
 * Parsing is delegated to marked (GFM) + marked-footnote, configured
 * identically to the parse half of @kevinpeckham/barkdown (`toDom`), so
 * rendered content stays in barkdown's canonical dialect and remains
 * round-trippable by its serializer. On top of that base the site adds
 * what marked deliberately does not do:
 *
 * - `sanitize`: raw HTML tokens are escaped (marked passes them through
 *   verbatim). Allowlisted empty inline tags (<br>, <hr>, <wbr>) survive.
 *   Links and images with unsafe URL schemes (javascript:, vbscript:,
 *   data:) are neutralized: the link renders as its text, the image as
 *   its alt text.
 * - `lazyImages`: rendered images get loading="lazy".
 *
 * YAML front matter extraction (`getFrontMatter`) is unchanged and is
 * stripped before parsing.
 *
 * @module parseMarkdown
 */

import { parse } from "yaml";

import { Marked, type Tokens } from "marked";
import markedFootnote from "marked-footnote";

/**
 * Type guard to check if a value is a valid frontmatter object
 */
function isFrontMatterObject(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Options for markdown parsing
 */
type ParseMarkdownOptions = {
	/** Escape raw HTML and unsafe URL schemes (default: false) */
	sanitize?: boolean;
	/** Use lazy loading for images (default: false) */
	lazyImages?: boolean;
};

/** Map of characters to their HTML entity equivalents */
const HTML_ESCAPE_MAP: Record<string, string> = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;",
	"'": "&#39;",
};

/**
 * Escape HTML special characters to prevent XSS
 * @param s - String to escape
 * @returns Escaped string safe for HTML insertion
 */
function escapeHtml(s: string): string {
	return s.replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char]);
}

/**
 * Safe HTML tags allowed through sanitization: self-closing/empty inline
 * tags, plus BARE (attribute-free) inline formatting tags that CMS authors
 * commonly type instead of markdown (`<strong>`, `<em>`, `<b>`, `<i>`,
 * `<u>`). Only the exact tag with no attributes matches — `<strong>` and
 * `</strong>` pass, `<strong onclick=…>` is escaped, so no event handler
 * or scheme can ride through. Matches: <br>, <br/>, <strong>, </em>, etc.
 */
const SAFE_HTML_TAGS = /^<\/?(br|hr|wbr|strong|em|b|i|u)(\s*\/?)>$/i;

/**
 * Escape `<` except for allowlisted safe HTML tags
 * @param s - String segment to process
 * @returns String with unsafe `<` escaped, safe tags preserved
 */
function escapeLtExceptSafe(s: string): string {
	// Match anything that looks like a tag (< followed by content until > or end)
	return s.replace(/<[^>]*>?/g, (tag) =>
		SAFE_HTML_TAGS.test(tag) ? tag : tag.replace(/</g, "&lt;"),
	);
}

/**
 * URL schemes that must never reach an href/src. Entities and embedded
 * whitespace/control characters are stripped before matching so encoded
 * forms ("java\tscript:", "&#106;avascript:") cannot slip through.
 */
function isUnsafeUrl(url: string | null | undefined): boolean {
	if (!url) return false;
	const decoded = url
		.replace(/&#x?([0-9a-f]+);?/gi, (_, code: string) =>
			String.fromCodePoint(Number.parseInt(code, /x/i.test(_) ? 16 : 10)),
		)
		.replace(/[\s\x00-\x1f]/g, "")
		.toLowerCase();
	return /^(javascript|vbscript|data):/.test(decoded);
}

/**
 * Build a Marked instance: barkdown's canonical configuration
 * (gfm + footnotes) plus the site's sanitize/lazy-image extensions.
 * Instances are cached per option combination.
 */
const markedCache = new Map<string, Marked>();

function getMarked(opts: Required<ParseMarkdownOptions>): Marked {
	const key = `${opts.sanitize}:${opts.lazyImages}`;
	const cached = markedCache.get(key);
	if (cached) return cached;

	const instance = new Marked({ gfm: true }).use(markedFootnote()).use({
		renderer: {
			// raw HTML (block and inline): strip comments, escape the rest
			// unless allowlisted
			html(token: Tokens.HTML | Tokens.Tag): string | false {
				if (!opts.sanitize) return false;
				const withoutComments = token.text.replace(/<!--[\s\S]*?-->/g, "");
				if (!withoutComments.trim()) return "";
				return escapeLtExceptSafe(withoutComments);
			},
			// links: drop the anchor (keep the text) on unsafe schemes
			link(token: Tokens.Link): string | false {
				if (opts.sanitize && isUnsafeUrl(token.href)) {
					return this.parser.parseInline(token.tokens);
				}
				return false;
			},
			// a paragraph that is exactly one image renders unwrapped, so the
			// article CSS img and img+p (caption) selectors keep matching
			paragraph(token: Tokens.Paragraph): string | false {
				if (token.tokens.length === 1 && token.tokens[0].type === "image") {
					return `${this.parser.parseInline(token.tokens)}\n`;
				}
				return false;
			},
			// images: drop to alt text on unsafe schemes; add lazy loading
			image(token: Tokens.Image): string | false {
				if (opts.sanitize && isUnsafeUrl(token.href)) {
					return escapeHtml(token.text);
				}
				if (!opts.lazyImages) return false;
				const title = token.title ? ` title="${escapeHtml(token.title)}"` : "";
				return `<img loading="lazy" src="${escapeHtml(token.href)}" alt="${escapeHtml(token.text)}"${title}>`;
			},
		},
	});

	markedCache.set(key, instance);
	return instance;
}

/**
 * Extract YAML front matter from markdown content
 *
 * Front matter must be at the start of the document, delimited by `---`:
 * ```
 * ---
 * title: My Post
 * author: "John Doe"
 * tags:
 *   - javascript
 *   - typescript
 * published: true
 * ---
 * Content here...
 * ```
 *
 * @param markdown - Raw markdown string
 * @returns Object containing parsed YAML front matter, or empty object if none
 *
 * @example
 * ```ts
 * const fm = getFrontMatter('---\ntitle: Hello\ntags: [js, ts]\n---\n# Content');
 * // Returns: { title: 'Hello', tags: ['js', 'ts'] }
 * ```
 */
export function getFrontMatter(markdown: string): Record<string, unknown> {
	const text = markdown.replace(/\r\n/g, "\n");
	const lines = text.split("\n");

	if (lines[0]?.trim() !== "---") return {};

	// Find closing fence
	let endIndex = -1;
	for (let i = 1; i < lines.length; i++) {
		if (lines[i].trim() === "---") {
			endIndex = i;
			break;
		}
	}

	if (endIndex === -1) {
		// Unclosed front matter → ignore
		return {};
	}

	// Extract YAML content between the fences
	const yamlContent = lines.slice(1, endIndex).join("\n");

	// Parse with yaml package
	try {
		const parsed: unknown = parse(yamlContent);

		// Validate that the parsed result is an object (not an array or primitive)
		if (!isFrontMatterObject(parsed)) {
			console.error("Frontmatter must be an object, got:", typeof parsed);
			return {};
		}

		return parsed;
	} catch (error) {
		// Log error for debugging but return empty object to fail gracefully
		console.error("Failed to parse frontmatter:", error);
		return {};
	}
}

/**
 * Remove front matter from markdown, returning only the content
 * @param markdown - Raw markdown string with optional front matter
 * @returns Markdown content without the front matter block
 */
function stripFrontMatter(markdown: string): string {
	const text = markdown.replace(/\r\n/g, "\n");
	if (!text.startsWith("---\n")) return text;
	const end = text.indexOf("\n---\n", 4);
	if (end === -1) return text;
	return text.slice(end + "\n---\n".length);
}

/**
 * Remove a single leading level-1 heading from a markdown body.
 *
 * CMS article bodies begin with `# Title` by convention, but the site
 * templates render their own <h1> from frontmatter — parsing the body
 * as-is produced duplicate h1s on every article page. Only the first
 * non-blank line is considered, and only an `# ` heading (deeper
 * headings and mid-document h1s are untouched).
 */
export function stripLeadingH1(markdown: string): string {
	return markdown.replace(/^\s*#[ \t][^\n]*\n?/, "");
}

/**
 * Convert markdown text to HTML
 *
 * Front matter is automatically stripped before parsing.
 *
 * @param params - Object containing markdown and options
 * @param params.markdown - Raw markdown string to parse
 * @param params.options - Parsing options
 * @param params.options.sanitize - Escape raw HTML and unsafe URL schemes
 * @param params.options.lazyImages - Add loading="lazy" to images
 * @returns HTML string
 *
 * @example
 * ```ts
 * const html = parseMarkdownTextToHtml({
 *   markdown: '# Hello\n\nThis is **bold**.',
 *   options: { sanitize: true }
 * });
 * // Returns: '<h1>Hello</h1>\n<p>This is <strong>bold</strong>.</p>\n'
 * ```
 */
export function parseMarkdownTextToHtml({
	markdown = "",
	options,
}: {
	markdown: string;
	options: ParseMarkdownOptions;
}): string {
	const text = stripFrontMatter(markdown);
	if (!text) return "";
	const marked = getMarked({
		sanitize: !!options?.sanitize,
		lazyImages: !!options?.lazyImages,
	});
	return marked.parse(text, { async: false }) as string;
}

/**
 * Parse markdown and extract both front matter and HTML content
 *
 * This is a convenience function that combines `getFrontMatter` and
 * `parseMarkdownTextToHtml` with sanitization enabled by default.
 *
 * @param markdown - Raw markdown string with optional front matter
 * @returns Object containing extracted front matter and rendered HTML
 *
 * @example
 * ```ts
 * const { frontMatter, html } = parseMarkdown(`---
 * title: My Post
 * ---
 * # Hello World
 *
 * This is my post.
 * `);
 *
 * // frontMatter = { title: 'My Post' }
 * // html = '<h1>Hello World</h1>\n<p>This is my post.</p>\n'
 * ```
 */
export function parseMarkdown(markdown: string): {
	frontMatter: Record<string, unknown>;
	html: string;
} {
	const frontMatter = getFrontMatter(markdown);
	const html = parseMarkdownTextToHtml({
		markdown,
		options: { sanitize: true },
	});
	return { frontMatter, html };
}
