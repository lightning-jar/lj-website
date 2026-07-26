// RFC 9727 API catalog content, exported so tests can pin its shape.
//
// The linkset serves both consumption patterns the RFC permits:
// - Appendix A.2 "bookmarks": a self-anchored entry whose `item` array
//   enumerates every machine-readable endpoint (consumers that walk
//   `item` links out from the catalog anchor find all members);
// - Appendix A.1 "per-API metadata": entries anchored on individual
//   endpoints carrying service-desc / service-doc / alternate links.
// §4.2 also wants a profile parameter on the media type (SHOULD).

export const BASE = "https://www.lightningjar.com";

export const API_CATALOG_CONTENT_TYPE = `application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"`;

// every machine-readable endpoint this site publishes; each verified to
// respond at authoring time (all GET 200 except /mcp, which is a
// POST-only JSON-RPC endpoint and answers GET with a JSON 405)
export const API_CATALOG_ITEMS = [
	{ href: `${BASE}/mcp`, type: "application/json" },
	{ href: `${BASE}/llms.txt`, type: "text/plain" },
	{ href: `${BASE}/search-index.json`, type: "application/json" },
	{ href: `${BASE}/sitemap.xml`, type: "application/xml" },
	{ href: `${BASE}/atom.xml`, type: "application/atom+xml" },
	{ href: `${BASE}/blog/atom.xml`, type: "application/atom+xml" },
	{ href: `${BASE}/customer-stories/atom.xml`, type: "application/atom+xml" },
	{ href: `${BASE}/reading-list/atom.xml`, type: "application/atom+xml" },
	{
		href: `${BASE}/research/barkup-bench/atom.xml`,
		type: "application/atom+xml",
	},
	{ href: `${BASE}/.well-known/mcp.json`, type: "application/json" },
	{
		href: `${BASE}/.well-known/mcp/server-card.json`,
		type: "application/json",
	},
	{
		href: `${BASE}/.well-known/agent-skills/index.json`,
		type: "application/json",
	},
] as const;

export const API_CATALOG = {
	linkset: [
		// A.2 pattern: the catalog's own anchor enumerating its members
		{
			anchor: `${BASE}/.well-known/api-catalog`,
			item: [...API_CATALOG_ITEMS],
		},
		// A.1 pattern: per-endpoint metadata for the richest members
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
					href: `${BASE}/customer-stories/atom.xml`,
					type: "application/atom+xml",
				},
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
