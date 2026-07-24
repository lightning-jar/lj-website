// WebMCP: expose the site's key actions to in-browser AI agents.
// The API is experimental — the W3C draft hangs ModelContext off
// `document`, while Chrome's early preview (and readiness scanners)
// probe `navigator` — so we feature-detect both and register through
// whichever surface exists. No-op everywhere else.
// Spec: https://webmachinelearning.github.io/webmcp/

import {
	filterSearchIndex,
	loadSearchIndex,
	type SearchRecord,
} from "$utils/siteSearch";

interface WebMcpToolResult {
	content: { type: "text"; text: string }[];
}

export interface WebMcpTool {
	name: string;
	description: string;
	inputSchema: Record<string, unknown>;
	annotations?: { readOnlyHint?: boolean };
	execute: (input: Record<string, unknown>) => Promise<WebMcpToolResult>;
}

interface ModelContextLike {
	provideContext?: (context: { tools: WebMcpTool[] }) => unknown;
	registerTool?: (tool: WebMcpTool) => unknown;
}

const text = (value: unknown): WebMcpToolResult => ({
	content: [
		{
			type: "text",
			text: typeof value === "string" ? value : JSON.stringify(value, null, 2),
		},
	],
});

export function buildWebMcpTools(deps: {
	loadIndex: () => Promise<SearchRecord[]>;
	navigate: (path: string) => void;
}): WebMcpTool[] {
	return [
		{
			name: "search_site",
			description:
				"Search Lightning Jar's content (blog articles, Barkup Bench research studies, customer stories, reading list) by keyword. Every term must match. Returns matching pages with URLs.",
			inputSchema: {
				type: "object",
				properties: {
					query: { type: "string", description: "Search terms" },
				},
				required: ["query"],
			},
			annotations: { readOnlyHint: true },
			execute: async (input) => {
				const query = typeof input.query === "string" ? input.query : "";
				const records = await deps.loadIndex();
				const results = filterSearchIndex(records, query, 10).map((record) => ({
					title: record.title,
					type: record.type,
					url: record.url,
					blurb: record.blurb,
				}));
				return text({ total: results.length, results });
			},
		},
		{
			name: "open_page",
			description:
				"Navigate this browser tab to a page on www.lightningjar.com. Takes a root-relative path like /blog or /research/barkup-bench/aa (use search_site to find paths).",
			inputSchema: {
				type: "object",
				properties: {
					path: {
						type: "string",
						description: "Root-relative path, e.g. /blog/some-article",
					},
				},
				required: ["path"],
			},
			execute: async (input) => {
				const path = typeof input.path === "string" ? input.path : "";
				if (!path.startsWith("/") || path.startsWith("//")) {
					return text(
						"Refused: path must be root-relative (start with a single /).",
					);
				}
				deps.navigate(path);
				return text(`Navigating to ${path}.`);
			},
		},
		{
			name: "get_agent_resources",
			description:
				"List Lightning Jar's machine-readable endpoints: MCP server, llms.txt, API catalog, feeds, and markdown content negotiation.",
			inputSchema: { type: "object", properties: {} },
			annotations: { readOnlyHint: true },
			execute: async () =>
				text({
					mcp: {
						endpoint: "https://www.lightningjar.com/mcp",
						transport: "streamable-http",
						authentication: "none",
						serverCard:
							"https://www.lightningjar.com/.well-known/mcp/server-card.json",
						note: "Richer than these in-page tools: full article bodies, study data, and search live there.",
					},
					llmsTxt: "https://www.lightningjar.com/llms.txt",
					apiCatalog: "https://www.lightningjar.com/.well-known/api-catalog",
					agentSkills:
						"https://www.lightningjar.com/.well-known/agent-skills/index.json",
					searchIndex: "https://www.lightningjar.com/search-index.json",
					markdownNegotiation:
						"Blog, customer-story, and reading-list article URLs return source markdown for requests with Accept: text/markdown.",
					feeds: [
						"https://www.lightningjar.com/atom.xml",
						"https://www.lightningjar.com/research/barkup-bench/atom.xml",
					],
				}),
		},
	];
}

// register on whichever experimental surface exists; returns true if
// tools were registered
export function initWebMcp(navigate: (path: string) => void): boolean {
	if (typeof window === "undefined") return false;
	const host = navigator as Navigator & { modelContext?: ModelContextLike };
	const doc = document as Document & { modelContext?: ModelContextLike };
	const context = host.modelContext ?? doc.modelContext;
	if (!context) return false;

	const tools = buildWebMcpTools({ loadIndex: loadSearchIndex, navigate });
	try {
		if (typeof context.provideContext === "function") {
			context.provideContext({ tools });
		} else if (typeof context.registerTool === "function") {
			for (const tool of tools) context.registerTool(tool);
		} else {
			return false;
		}
		return true;
	} catch {
		return false;
	}
}
