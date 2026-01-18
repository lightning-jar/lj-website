type ParseMarkdownOptions = {
	sanitize?: boolean;
	lazyImages?: boolean;
};

function escapeHtml(s: string): string {
	return s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

export function getFrontMatter(markdown: string): Record<string, string> {
	const fm: Record<string, string> = {};
	const text = markdown.replace(/\r\n/g, "\n");
	const lines = text.split("\n");

	if (lines[0]?.trim() !== "---") return fm;

	// Find closing fence strictly
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

	for (let i = 1; i < endIndex; i++) {
		const line = lines[i];
		if (!line.trim()) continue;
		const match = line.match(/^([A-Za-z0-9_.-]+)\s*:\s*(.*)$/);
		if (!match) continue;
		const [, key, rawValue] = match;
		const q = rawValue.trim();
		const value =
			(q.startsWith('"') && q.endsWith('"')) ||
			(q.startsWith("'") && q.endsWith("'"))
				? q.slice(1, -1)
				: q;
		fm[key] = value;
	}

	return fm;
}

function stripFrontMatter(markdown: string): string {
	const text = markdown.replace(/\r\n/g, "\n");
	if (!text.startsWith("---\n")) return text;
	const end = text.indexOf("\n---\n", 4);
	if (end === -1) return text;
	return text.slice(end + "\n---\n".length);
}

/*
    Inline pipeline order with new features:
    1) Protect inline code spans with placeholders, escaping inner content
    2) Autolinks (bare URLs)
    3) Images
    4) Links
    5) Bold
    6) Italic
    7) Restore inline code placeholders
*/

// Add these near your inline transform helpers (top-level or inside the module)
const CODE_START = "<<<MD_CODE:";
const CODE_END = ":END_MD_CODE>>>";

type InlineOpts = { sanitize: boolean; lazyImages: boolean };

function applyInlineTransforms(input: string, opts: InlineOpts): string {
	let s = input;

	// 1) Inline code protection: capture raw, then escape only code content
	const codePlaceholders: string[] = [];
	s = s.replace(/`([^`\n]+)`/g, (_, code) => {
		const escaped = escapeHtml(code); // always escape code content
		const token = `${CODE_START}${codePlaceholders.length}${CODE_END}`;
		codePlaceholders.push(`<code>${escaped}</code>`);
		return token;
	});

	// 1.5) Pre-escape any raw HTML when sanitizing, before injecting our own tags
	if (opts.sanitize) {
		// Protect placeholders: split by placeholder tokens and escape only non-placeholder chunks
		const tokenRe = new RegExp(`${CODE_START}\\d+${CODE_END}`, "g");
		const parts: string[] = [];
		let lastIndex = 0;
		for (;;) {
			const m = tokenRe.exec(s);
			if (!m) break;
			// Escape segment before the token
			parts.push(
				s.slice(lastIndex, m.index).replace(/</g, "&lt;").replace(/>/g, "&gt;"),
			);
			// Keep the token intact
			parts.push(m[0]);
			lastIndex = m.index + m[0].length;
		}
		// Tail
		parts.push(s.slice(lastIndex).replace(/</g, "&lt;").replace(/>/g, "&gt;"));
		s = parts.join("");
	}

	// 2) Images first to prevent URL being autolinked inside link syntax
	s = s.replace(
		/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g,
		(_, alt, url, title) => {
			const a = opts.sanitize ? escapeHtml(alt) : alt;
			const u = opts.sanitize ? escapeHtml(url) : url;
			const t = title ? (opts.sanitize ? escapeHtml(title) : title) : null;
			const loading = opts.lazyImages ? "lazy" : "auto";
			const titleAttr = t ? ` title="${t}"` : "";
			return `<img loading="${loading}" class="w-full h-auto rounded overflow-hidden mb-5" src="${u}" alt="${a}"${titleAttr}>`;
		},
	);

	// 3) Links with optional title
	s = s.replace(
		/\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g,
		(_, text, url, title) => {
			const t = opts.sanitize ? escapeHtml(text) : text;
			const u = opts.sanitize ? escapeHtml(url) : url;
			const titleAttr = title
				? ` title="${opts.sanitize ? escapeHtml(title) : title}"`
				: "";
			return `<a href="${u}"${titleAttr}>${t}</a>`;
		},
	);

	// 4) Autolinks ONLY in text nodes (avoid inside tags/attributes)
	{
		const parts = s.split(/(<[^>]+>)/g);
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
		s = parts.join("");
	}

	// 5) Bold
	s = s.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");

	// 6) Italic (not adjacent to other *)
	s = s.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, "<em>$1</em>");

	// 7) Restore inline code placeholders
	const restoreCodeRegex = new RegExp(`${CODE_START}(\\d+)${CODE_END}`, "g");
	s = s.replace(
		restoreCodeRegex,
		(_, i: string) => codePlaceholders[Number(i)],
	);

	// 8) Final sanitization for raw text outside tags
	if (opts.sanitize) {
		const parts = s.split(/(<[^>]+>)/g);
		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];
			if (!part || part.startsWith("<")) continue;
			parts[i] = part.replace(/</g, "&lt;").replace(/>/g, "&gt;");
		}
		s = parts.join("");
	}

	return s;
}

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

	type Block = "none" | "ul" | "ol" | "code";

	function isCodeBlock(b: Block): b is "code" {
		return b === "code";
	}

	let block: Block = "none";
	let codeLang = "";
	let codeBuffer: string[] = [];

	const closeList = () => {
		if (block === "ul") html.push("</ul>");
		else if (block === "ol") html.push("</ol>");
		block = "none";
	};

	// Paragraph grouping buffer
	let paraBuffer: string[] = [];
	const flushParagraph = () => {
		if (paraBuffer.length === 0) return;
		const joined = paraBuffer.join(" ").trim();
		paraBuffer = [];
		const t = applyInlineTransforms(joined, { sanitize, lazyImages });
		if (/^<img\b[^>]*>$/.test(t)) {
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
			flushParagraph();
			continue;
		}

		// Headings
		const headingMatch = line.match(/^#{1,6}/);
		if (headingMatch) {
			const level = Math.min(6, headingMatch[0].length);
			if (block === "ul" || block === "ol") closeList();
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
		paraBuffer.push(line.trim());
	}

	const b: Block = block; // re-widen and “reset” control-flow narrowing

	// Close any remaining blocks
	if (isCodeBlock(b)) {
		// Unclosed fence: treat as code block end
		endCodeBlock();
	}
	if (block === "ul" || block === "ol") {
		closeList();
	}
	flushParagraph();

	return html.join("");
}

export function parseMarkdown(markdown: string): {
	frontMatter: Record<string, string>;
	html: string;
} {
	const frontMatter = getFrontMatter(markdown);
	const html = parseMarkdownTextToHtml({
		markdown,
		options: { sanitize: true },
	});
	return { frontMatter, html };
}
