export function getFrontMatter(markdown: string): Record<string, string> {
	const lines = markdown.split("\n");
	const frontMatter: Record<string, string> = {};

	let inFrontMatter = false;
	for (const line of lines) {
		if (line.startsWith("---")) {
			inFrontMatter = !inFrontMatter;
			continue;
		}

		if (!inFrontMatter) break;

		const keyRegex = /^[a-z0-9_]*?: /i;
		const key = line.match(keyRegex)?.[0].trim().replace(/:/, "");
		const value = line.replace(keyRegex, "");
		if (key && value) frontMatter[key] = value;
	}

	return frontMatter;
}

type ParseMarkdownOptions = {
	sanitize?: boolean;
	lazyImages?: boolean;
};

export function parseMarkdownTextToHtml({
	markdown = "",
	options,
}: {
	markdown: string;
	options: ParseMarkdownOptions;
}): string {
	const text = markdown.replace(/^---[\s\S]*?---/, "");

	// create array of lines
	const lines = text.split("\n");

	// scrub empty lines
	const scrubbed = lines.filter((line) => line.trim().length > 0);

	const html = [];

	// let inCodeBlock = false;

	let listType = "ul";
	let lastLineType = "text";
	for (const line of scrubbed) {
		// replace headings with html
		if (line.startsWith("#")) {
			const level = line.match(/^#+/)?.[0].length || 0;
			const text = line.slice(level + 1).trim();
			if (lastLineType === "list") {
				html.push(`</${listType}>`);
			}
			html.push(`<h${level}>${text}</h${level}>`);
			lastLineType = "heading";
			listType = "ul";
		}

		// replace plain text with html
		else if (
			!["* ", "#", "- ", "+ ", "--"].includes(line.trim()?.substring(0, 2))
		) {
			// replace any bold text in the string with <strong> tags
			const boldRegex = /\*\*([^*]+)\*\*/g;
			const bolded = line.replace(boldRegex, "<strong>$1</strong>");

			// replace any italics in the string with <em> tags
			const italicRegex = /\*([^*]+)\*/g;
			const italicized = bolded.replace(italicRegex, "<em>$1</em>");
			if (lastLineType === "list") {
				html.push(`</${listType}>`);
			}

			// replace any images with <img> tags
			const imageRegex = /!\[([^\]]+)\]\(([^)]+)\)/g;
			const image = italicized.replace(
				imageRegex,
				`<img loading="${options?.lazyImages ? "lazy" : "auto"}" class="w-full h-auto rounded overflow-hidden mb-5" src="$2" alt="$1">`,
			);

			// replace any links with <a> tags
			const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
			const linked = image.replace(linkRegex, '<a href="$2">$1</a>');

			if (linked.includes("<img")) {
				html.push(`${linked}`);
			} else {
				html.push(`<p>${linked}</p>`);
			}
			lastLineType = "text";
			listType = "ul";
		}

		// lists
		else if (
			line.startsWith("- ") ||
			line.startsWith("+ ") ||
			line.startsWith("* ") ||
			line.match(/^(\d+)\. /)
		) {
			const type = line.match(/^(\d+)\. /) ? "ol" : "ul";
			const text = line.slice(2).trim();
			if (lastLineType === "list") {
				html.push(`<li>${text}</li>`);
			} else {
				html.push(`<${type}><li>${text}</li>`);
				lastLineType = "list";
				listType = type;
			}
		}
	}
	return html.join("");
}

export function parseMarkdown(markdown: string): {
	frontMatter: Record<string, string>;
	html: string;
} {
	// get front matter
	const frontMatter = getFrontMatter(markdown) || {};

	const html = parseMarkdownTextToHtml({
		markdown,
		options: { sanitize: true },
	});

	return { frontMatter, html };
}
