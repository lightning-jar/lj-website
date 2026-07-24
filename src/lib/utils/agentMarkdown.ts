// Markdown for agents: requests with `Accept: text/markdown` on article
// pages get the source markdown instead of rendered HTML (see
// hooks.server.ts). Builders are pure so they can be unit-tested; data
// arrives from the CMS getters.

export type AgentMarkdownRoute = {
	type: "blog" | "customer-story" | "reading-list";
	slug: string;
};

// Match /blog/[slug], /customer-stories/[slug], /reading-list/[slug].
// Slugs with dots (atom.xml) and nested paths (blog/preview/[token])
// never match.
export function agentMarkdownRouteFor(
	pathname: string,
): AgentMarkdownRoute | undefined {
	const match = pathname.match(
		/^\/(blog|customer-stories|reading-list)\/([^/.]+)$/,
	);
	if (!match) return undefined;
	const type =
		match[1] === "blog"
			? "blog"
			: match[1] === "customer-stories"
				? "customer-story"
				: "reading-list";
	return { type, slug: match[2] };
}

function frontmatterBlock(fields: Record<string, unknown>): string {
	const lines = Object.entries(fields)
		.filter(([, value]) => value !== undefined && value !== null)
		.filter(([, value]) => !(Array.isArray(value) && value.length === 0))
		.map(
			([key, value]) =>
				`${key}: ${Array.isArray(value) ? JSON.stringify(value) : String(value)}`,
		);
	return lines.length ? `---\n${lines.join("\n")}\n---\n\n` : "";
}

export function blogMarkdownDoc(input: {
	title?: string;
	date?: string;
	author?: string;
	description?: string;
	tags?: string[];
	url: string;
	markdown: string;
}): string {
	return (
		frontmatterBlock({
			title: input.title,
			date: input.date,
			author: input.author,
			description: input.description,
			tags: input.tags,
			canonical: input.url,
		}) + `# ${input.title ?? ""}\n\n${input.markdown.trim()}\n`
	);
}

export function storyMarkdownDoc(input: {
	title?: string;
	customer?: string;
	excerpt?: string;
	tags?: string[];
	url: string;
	markdown: string;
}): string {
	return (
		frontmatterBlock({
			title: input.title,
			customer: input.customer,
			description: input.excerpt,
			tags: input.tags,
			canonical: input.url,
		}) + `# ${input.title ?? ""}\n\n${input.markdown.trim()}\n`
	);
}

// reading-list entries have empty bodies: the document is the metadata
export function readingListMarkdownDoc(input: {
	title?: string;
	author?: string;
	publication?: string;
	summary?: string;
	sourceUrl?: string;
	tags?: string[];
	url: string;
}): string {
	const attribution = [input.author, input.publication]
		.filter(Boolean)
		.join(", ");
	const parts = [
		frontmatterBlock({
			title: input.title,
			author: input.author,
			publication: input.publication,
			tags: input.tags,
			canonical: input.url,
			source: input.sourceUrl,
		}) + `# ${input.title ?? ""}`,
		attribution ? `By ${attribution}.` : "",
		input.summary ?? "",
		input.sourceUrl ? `Read the original: ${input.sourceUrl}` : "",
	];
	return `${parts.filter(Boolean).join("\n\n")}\n`;
}

// rough token estimate for the x-markdown-tokens header
export function estimateTokens(text: string): number {
	return Math.ceil(text.length / 4);
}

export function markdownResponse(doc: string): Response {
	return new Response(doc, {
		headers: {
			"content-type": "text/markdown; charset=utf-8",
			"cache-control": "public, s-maxage=300, stale-while-revalidate=3600",
			"x-markdown-tokens": String(estimateTokens(doc)),
			vary: "Accept",
		},
	});
}
