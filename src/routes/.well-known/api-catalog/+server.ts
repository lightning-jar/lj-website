import type { RequestHandler } from "./$types";

// API catalog (RFC 9727): linkset advertising this site's public,
// keyless agent-facing endpoints. Static content, but served from a
// route so the application/linkset+json media type is guaranteed.
export const prerender = false;

const BASE = "https://www.lightningjar.com";

const catalog = {
	linkset: [
		{
			anchor: `${BASE}/mcp`,
			"service-desc": [
				{
					href: `${BASE}/.well-known/mcp/server-card.json`,
					type: "application/json",
					title: "MCP server card (streamable HTTP, keyless, read-only)",
				},
			],
			"service-doc": [
				{
					href: `${BASE}/llms.txt`,
					type: "text/plain",
					title: "LLM-readable site index and endpoint documentation",
				},
			],
		},
		{
			anchor: `${BASE}/search-index.json`,
			"service-doc": [
				{
					href: `${BASE}/llms.txt`,
					type: "text/plain",
					title: "Site search index: all content records as JSON",
				},
			],
		},
		{
			anchor: `${BASE}/sitemap.xml`,
			alternate: [
				{ href: `${BASE}/atom.xml`, type: "application/atom+xml" },
				{ href: `${BASE}/blog/atom.xml`, type: "application/atom+xml" },
				{
					href: `${BASE}/reading-list/atom.xml`,
					type: "application/atom+xml",
				},
				{
					href: `${BASE}/research/barkup-bench/atom.xml`,
					type: "application/atom+xml",
				},
			],
		},
	],
};

export const GET: RequestHandler = () =>
	new Response(JSON.stringify(catalog, null, "\t"), {
		headers: {
			"content-type": "application/linkset+json",
			"cache-control": "public, s-maxage=86400, stale-while-revalidate=86400",
		},
	});
