/**
 * Lightweight Markdown Parser
 *
 * A custom markdown-to-HTML converter with XSS protection.
 * Supports a subset of CommonMark plus GitHub Flavored Markdown extensions.
 *
 * ## Supported Features
 *
 * **Block elements:**
 * - Headings (# through ######)
 * - Paragraphs (with hard line breaks via trailing spaces)
 * - Ordered and unordered lists
 * - Fenced code blocks (``` with optional language)
 * - Blockquotes (>)
 * - Horizontal rules (---, ***, ___)
 * - Tables (GFM style with | delimiters)
 *
 * **Inline elements:**
 * - Bold (**text** or __text__)
 * - Italic (*text* or _text_)
 * - Bold+Italic (***text***)
 * - Strikethrough (~~text~~)
 * - Inline code (`code`)
 * - Links ([text](url "title"))
 * - Images (![alt](url "title"))
 * - Autolinks (bare URLs)
 * - Escape sequences (\* for literal *)
 *
 * **Other:**
 * - YAML front matter (--- delimited)
 * - HTML comment stripping
 * - XSS protection via HTML escaping
 * - Safe inline HTML tags (<br>, <hr>, <wbr>) pass through when sanitizing
 *
 * @module parseMarkdown
 */

import { parse } from "yaml";

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
	/** Escape HTML to prevent XSS attacks (default: false) */
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

// =============================================================================
// Inline Transform Pipeline
// =============================================================================
//
// Transforms are applied in a specific order to handle nesting correctly:
// 1. Strip HTML comments
// 2. Protect escape sequences (\* -> placeholder)
// 3. Protect code spans (`code` -> placeholder)
// 4. Pre-sanitize raw HTML (escape < to prevent XSS)
// 5. Process images (before links to prevent URL conflicts)
// 6. Process links
// 7. Process autolinks (bare URLs)
// 8. Process emphasis (bold, italic, strikethrough)
// 9. Restore code spans
// 10. Restore escape sequences
// =============================================================================

/** Placeholder tokens for protecting content during transforms */
const CODE_START = "<<<MD_CODE:";
const CODE_END = ":END_MD_CODE>>>";
const HARD_BREAK = "\0MD_BR\0";
const ESC_START = "\0ESC:";
const ESC_END = ":ESC\0";

/** Options passed to inline transform functions */
type InlineOpts = { sanitize: boolean; lazyImages: boolean };

/** Strip HTML comments from the input */
function stripComments(s: string): string {
	return s.replace(/<!--[\s\S]*?-->/g, "");
}

/** Replace backslash escapes with placeholders to protect them from other transforms */
function protectEscapes(s: string, escapes: string[]): string {
	// Match backslash followed by a punctuation/special character
	return s.replace(/\\([\\`*_{}[\]()#+\-.!~|>])/g, (_, char) => {
		const token = `${ESC_START}${escapes.length}${ESC_END}`;
		escapes.push(char);
		return token;
	});
}

/** Restore escape placeholders with the literal characters */
function restoreEscapes(
	s: string,
	escapes: string[],
	sanitize: boolean,
): string {
	const restoreRegex = new RegExp(`${ESC_START}(\\d+)${ESC_END}`, "g");
	return s.replace(restoreRegex, (_, i: string) => {
		const char = escapes[Number(i)];
		// Escape HTML special chars if sanitizing
		return sanitize ? escapeHtml(char) : char;
	});
}

/** Replace inline code spans with placeholders to protect them from other transforms */
function protectCodeSpans(s: string, placeholders: string[]): string {
	return s.replace(/`([^`\n]+)`/g, (_, code) => {
		const escaped = escapeHtml(code);
		const token = `${CODE_START}${placeholders.length}${CODE_END}`;
		placeholders.push(`<code>${escaped}</code>`);
		return token;
	});
}

/**
 * Safe HTML tags allowed through sanitization (self-closing or empty inline tags).
 * Pattern matches: <br>, <br/>, <br />, <hr>, <hr/>, etc.
 */
const SAFE_HTML_TAGS = /^<(br|hr|wbr)(\s*\/?)>$/i;

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

/** Escape raw HTML tags to prevent XSS, preserving allowlisted safe tags */
function preSanitize(s: string): string {
	const tokenRe = new RegExp(`${CODE_START}\\d+${CODE_END}`, "g");
	const parts: string[] = [];
	let lastIndex = 0;
	for (;;) {
		const m = tokenRe.exec(s);
		if (!m) break;
		parts.push(escapeLtExceptSafe(s.slice(lastIndex, m.index)));
		parts.push(m[0]);
		lastIndex = m.index + m[0].length;
	}
	parts.push(escapeLtExceptSafe(s.slice(lastIndex)));
	return parts.join("");
}

/** Convert markdown image syntax to HTML img tags */
function processImages(s: string, opts: InlineOpts): string {
	return s.replace(
		/!\[([^[\]]*(?:\[[^\]]*\][^[\]]*)*)\]\(([^()\s]*(?:\([^)]*\)[^()\s]*)*)(?:\s+"([^"]*)")?\)/g,
		(_, alt, url, title) => {
			const a = opts.sanitize ? escapeHtml(alt) : alt;
			const u = opts.sanitize ? escapeHtml(url) : url;
			const t = title ? (opts.sanitize ? escapeHtml(title) : title) : null;
			const loading = opts.lazyImages ? "lazy" : "auto";
			const titleAttr = t ? ` title="${t}"` : "";
			return `<img loading="${loading}" src="${u}" alt="${a}"${titleAttr}>`;
		},
	);
}

/** Convert markdown link syntax to HTML anchor tags */
function processLinks(s: string, opts: InlineOpts): string {
	return s.replace(
		/\[([^[\]]*(?:\[[^\]]*\][^[\]]*)*)\]\(([^()\s]*(?:\([^)]*\)[^()\s]*)*)(?:\s+"([^"]*)")?\)/g,
		(_, text, url, title) => {
			const t = opts.sanitize ? escapeHtml(text) : text;
			const u = opts.sanitize ? escapeHtml(url) : url;
			const titleAttr = title
				? ` title="${opts.sanitize ? escapeHtml(title) : title}"`
				: "";
			return `<a href="${u}"${titleAttr}>${t}</a>`;
		},
	);
}

/** Convert bare URLs to anchor tags (only in text nodes, not inside tags) */
function processAutolinks(s: string, opts: InlineOpts): string {
	const parts = s.split(/(<(?:[^>"']|"[^"]*"|'[^']*')*>)/g);
	for (let i = 0; i < parts.length; i++) {
		const part = parts[i];
		if (!part || part.startsWith("<")) continue;
		parts[i] = part.replace(
			/\bhttps?:\/\/[^\s<>()]+[^\s<>().,!?;:)]/g,
			(url: string) => {
				const u = opts.sanitize ? escapeHtml(url) : url;
				return `<a href="${u}" rel="noopener noreferrer" target="_blank">${u}</a>`;
			},
		);
	}
	return parts.join("");
}

/** Process bold, italic, strikethrough, and combined bold+italic emphasis */
function processEmphasis(s: string): string {
	// Bold+Italic: ***text*** (must come before separate bold/italic)
	s = s.replace(/\*\*\*([^*\n]+)\*\*\*/g, "<strong><em>$1</em></strong>");
	// Bold: **text** (non-greedy, allows single asterisks inside)
	s = s.replace(/\*\*(?!\*)(.+?)\*\*(?!\*)/g, "<strong>$1</strong>");
	// Italic (not adjacent to other *)
	s = s.replace(/(?<!\*)\*(?!\*)([^*\n]+)\*(?!\*)/g, "<em>$1</em>");
	// Strikethrough: ~~text~~ (GFM extension)
	s = s.replace(/~~([^~\n]+)~~/g, "<del>$1</del>");
	return s;
}

/** Restore code span placeholders with their HTML */
function restoreCodeSpans(s: string, placeholders: string[]): string {
	const restoreRegex = new RegExp(`${CODE_START}(\\d+)${CODE_END}`, "g");
	return s.replace(restoreRegex, (_, i: string) => placeholders[Number(i)]);
}

/** Apply all inline transforms in the correct order */
function applyInlineTransforms(input: string, opts: InlineOpts): string {
	const escapePlaceholders: string[] = [];
	const codePlaceholders: string[] = [];
	let s = input;

	s = stripComments(s);
	s = protectEscapes(s, escapePlaceholders);
	s = protectCodeSpans(s, codePlaceholders);
	if (opts.sanitize) {
		s = preSanitize(s);
	}
	s = processImages(s, opts);
	s = processLinks(s, opts);
	s = processAutolinks(s, opts);
	s = processEmphasis(s);
	s = restoreCodeSpans(s, codePlaceholders);
	s = restoreEscapes(s, escapePlaceholders, opts.sanitize);

	return s;
}

/**
 * Convert markdown text to HTML
 *
 * This is the main parsing function that handles both block and inline elements.
 * Front matter is automatically stripped before parsing.
 *
 * @param params - Object containing markdown and options
 * @param params.markdown - Raw markdown string to parse
 * @param params.options - Parsing options
 * @param params.options.sanitize - Escape HTML to prevent XSS (recommended for user content)
 * @param params.options.lazyImages - Add loading="lazy" to images
 * @returns HTML string
 *
 * @example
 * ```ts
 * const html = parseMarkdownTextToHtml({
 *   markdown: '# Hello\n\nThis is **bold**.',
 *   options: { sanitize: true }
 * });
 * // Returns: '<h1>Hello</h1><p>This is <strong>bold</strong>.</p>'
 * ```
 */
export function parseMarkdownTextToHtml({
	markdown = "",
	options,
}: {
	markdown: string;
	options: ParseMarkdownOptions;
}): string {
	const sanitize = !!options?.sanitize;
	const lazyImages = !!options?.lazyImages;

	const text = stripFrontMatter(markdown);
	const lines = text.replace(/\r\n/g, "\n").split("\n");

	const html: string[] = [];

	type Block = "none" | "ul" | "ol" | "code" | "blockquote" | "table";

	function isCodeBlock(b: Block): b is "code" {
		return b === "code";
	}

	let block: Block = "none";
	let codeLang = "";
	let codeBuffer: string[] = [];
	let blockquoteBuffer: string[] = [];
	let tableRows: string[][] = [];
	let tableSeparatorIndex = -1;

	const closeList = () => {
		if (block === "ul") html.push("</ul>");
		else if (block === "ol") html.push("</ol>");
		block = "none";
	};

	const closeBlockquote = () => {
		if (block !== "blockquote" || blockquoteBuffer.length === 0) return;
		const content = blockquoteBuffer.join(" ").trim();
		const t = applyInlineTransforms(content, { sanitize, lazyImages });
		html.push(`<blockquote>${t}</blockquote>`);
		blockquoteBuffer = [];
		block = "none";
	};

	const parseTableRow = (line: string): string[] => {
		// Remove leading/trailing pipes and split by |
		const trimmed = line.replace(/^\||\|$/g, "");
		return trimmed.split("|").map((cell) => cell.trim());
	};

	const isTableSeparator = (line: string): boolean => {
		// Matches |---|---| or ---|--- with optional colons for alignment
		return /^\|?(\s*:?-+:?\s*\|)+\s*:?-+:?\s*\|?$/.test(line);
	};

	const flushTable = () => {
		if (block !== "table" || tableRows.length === 0) return;

		const out: string[] = ["<table>"];

		// Header rows (before separator)
		if (tableSeparatorIndex > 0) {
			out.push("<thead>");
			for (let i = 0; i < tableSeparatorIndex; i++) {
				out.push("<tr>");
				for (const cell of tableRows[i]) {
					const t = applyInlineTransforms(cell, { sanitize, lazyImages });
					out.push(`<th>${t}</th>`);
				}
				out.push("</tr>");
			}
			out.push("</thead>");
		}

		// Body rows (after separator)
		const bodyStart = tableSeparatorIndex > 0 ? tableSeparatorIndex : 0;
		if (bodyStart < tableRows.length) {
			out.push("<tbody>");
			for (let i = bodyStart; i < tableRows.length; i++) {
				out.push("<tr>");
				for (const cell of tableRows[i]) {
					const t = applyInlineTransforms(cell, { sanitize, lazyImages });
					out.push(`<td>${t}</td>`);
				}
				out.push("</tr>");
			}
			out.push("</tbody>");
		}

		out.push("</table>");
		html.push(out.join(""));

		tableRows = [];
		tableSeparatorIndex = -1;
		block = "none";
	};

	// Paragraph grouping buffer
	let paraBuffer: string[] = [];
	const flushParagraph = () => {
		if (paraBuffer.length === 0) return;
		const joined = paraBuffer.join(" ").trim();
		paraBuffer = [];
		let t = applyInlineTransforms(joined, { sanitize, lazyImages });
		// Restore hard break placeholders after sanitization
		t = t.replaceAll(HARD_BREAK, "<br>");
		// Pattern handles quoted attributes containing ">"
		if (/^<img\b(?:[^>"']|"[^"]*"|'[^']*')*>$/.test(t)) {
			html.push(t);
		} else {
			html.push(`<p>${t}</p>`);
		}
	};

	const startCodeBlock = (lang: string) => {
		if (block === "ul" || block === "ol") closeList();
		flushParagraph();
		block = "code";
		codeLang = lang;
		codeBuffer = [];
	};

	const endCodeBlock = () => {
		const codeContent = codeBuffer.join("\n");
		const escaped = escapeHtml(codeContent);
		const langAttr = codeLang
			? ` class="language-${escapeHtml(codeLang)}"`
			: "";
		html.push(`<pre><code${langAttr}>${escaped}</code></pre>`);
		codeBuffer = [];
		codeLang = "";
		block = "none";
	};

	for (const raw of lines) {
		const line = raw;

		// Check fenced code block fences
		// Handle code block lines with early-continue using the type guard
		if (isCodeBlock(block)) {
			if (/^```+\s*$/.test(line)) {
				endCodeBlock();
			} else {
				codeBuffer.push(line);
			}
			continue;
		}

		// Not in a code block: check for code block start
		const fenceStart = line.match(/^```+\s*([A-Za-z0-9_+-]*)\s*$/);
		if (fenceStart) {
			startCodeBlock(fenceStart[1] || "");
			continue;
		}

		// Blank line: boundary between blocks/paragraphs
		if (!line.trim()) {
			if (block === "ul" || block === "ol") {
				closeList();
			}
			closeBlockquote();
			flushTable();
			flushParagraph();
			continue;
		}

		// Horizontal rule: ---, ***, ___ (three or more, optionally with spaces)
		if (/^(?:[-*_]\s*){3,}$/.test(line.trim())) {
			if (block === "ul" || block === "ol") closeList();
			closeBlockquote();
			flushParagraph();
			html.push("<hr>");
			continue;
		}

		// Blockquote
		const bqMatch = line.match(/^>\s?(.*)$/);
		if (bqMatch) {
			if (block === "ul" || block === "ol") closeList();
			flushTable();
			flushParagraph();
			if (block !== "blockquote") {
				block = "blockquote";
				blockquoteBuffer = [];
			}
			blockquoteBuffer.push(bqMatch[1]);
			continue;
		}

		// Table rows (lines containing |)
		if (line.includes("|")) {
			if (block === "ul" || block === "ol") closeList();
			closeBlockquote();
			flushParagraph();

			if (block !== "table") {
				block = "table";
				tableRows = [];
				tableSeparatorIndex = -1;
			}

			if (isTableSeparator(line)) {
				tableSeparatorIndex = tableRows.length;
			} else {
				tableRows.push(parseTableRow(line));
			}
			continue;
		}

		// If we were in a table but this line isn't a table row, flush it
		if (block === "table") {
			flushTable();
		}

		// Headings
		const headingMatch = line.match(/^#{1,6}/);
		if (headingMatch) {
			const level = Math.min(6, headingMatch[0].length);
			if (block === "ul" || block === "ol") closeList();
			closeBlockquote();
			flushParagraph();
			const content = line.slice(level).trim();
			const t = applyInlineTransforms(content, { sanitize, lazyImages });
			html.push(`<h${level}>${t}</h${level}>`);
			continue;
		}

		// Ordered list
		const olMatch = line.match(/^(\d+)\.\s+(.*)$/);
		if (olMatch) {
			if (block === "ul") closeList();
			closeBlockquote();
			flushParagraph();
			if (block !== "ol") {
				html.push("<ol>");
				block = "ol";
			}
			const content = olMatch[2];
			const t = applyInlineTransforms(content, { sanitize, lazyImages });
			html.push(`<li>${t}</li>`);
			continue;
		}

		// Unordered list
		const ulMatch = line.match(/^[-+*]\s+(.*)$/);
		if (ulMatch) {
			if (block === "ol") closeList();
			closeBlockquote();
			flushParagraph();
			if (block !== "ul") {
				html.push("<ul>");
				block = "ul";
			}
			const content = ulMatch[1];
			const t = applyInlineTransforms(content, { sanitize, lazyImages });
			html.push(`<li>${t}</li>`);
			continue;
		}

		// Otherwise: part of a paragraph (grouping)
		closeBlockquote();
		// Preserve hard breaks: two trailing spaces + newline becomes <br>
		const hasHardBreak = line.endsWith("  ");
		paraBuffer.push(line.trim() + (hasHardBreak ? HARD_BREAK : ""));
	}

	const b: Block = block; // re-widen and "reset" control-flow narrowing

	// Close any remaining blocks
	if (isCodeBlock(b)) {
		// Unclosed fence: treat as code block end
		endCodeBlock();
	}
	if (block === "ul" || block === "ol") {
		closeList();
	}
	closeBlockquote();
	flushTable();
	flushParagraph();

	return html.join("");
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
 * // html = '<h1>Hello World</h1><p>This is my post.</p>'
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
