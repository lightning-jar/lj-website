import { json } from "@sveltejs/kit";

import type { RequestHandler } from "./$types";

// One shared tool layer serves both this public MCP endpoint and the
// concierge chat (/api/concierge) — the data functions live in
// #lib/server/agentTools so the two surfaces can never drift.
import {
	aboutLightningJar,
	listBlogArticles,
	listCustomerStories,
	listPackages,
	listReadingList,
	listStudies,
	readBlogArticle,
	readCustomerStory,
	readPage,
	readStudy,
	searchContent,
} from "#lib/server/agentTools.js";
import { createRateLimiter } from "#lib/server/rateLimit.js";
import { createMcpHandler } from "mcp-handler";
import { ENV } from "varlock/env";
import { z } from "zod";

// Public, keyless, read-only MCP endpoint (streamable HTTP, stateless):
// everything it serves is already public on the site, so agent reach is
// maximized — the point of agent readiness. Discovery:
// /.well-known/mcp.json and /llms.txt.
export const prerender = false;

type Fetch = typeof globalThis.fetch;

function handlerFor(fetch: Fetch) {
	return createMcpHandler(
		(server) => {
			const text = (value: unknown) => ({
				content: [
					{ type: "text" as const, text: JSON.stringify(value, null, 2) },
				],
			});

			server.registerTool(
				"about_lightning_jar",
				{
					description:
						"Who Lightning Jar is, what the studio does, and the site's key surfaces (research, playbook, packages, contact).",
					inputSchema: z.object({}),
				},
				() => text(aboutLightningJar()),
			);

			server.registerTool(
				"search_content",
				{
					description:
						"Search Lightning Jar's blog articles, customer stories, reading-list entries, technologies, and open-source packages by keyword. Every term must match somewhere in the title, description, summary, or tags.",
					inputSchema: z.object({
						query: z.string().min(1).describe("Search terms, space-separated"),
						collection: z
							.enum([
								"blog",
								"customer-story",
								"reading-list",
								"technology",
								"package",
							])
							.optional()
							.describe("Restrict to one collection"),
					}),
				},
				async ({ query, collection }: { query: string; collection?: string }) =>
					text(await searchContent(fetch, query, collection)),
			);

			server.registerTool(
				"list_blog_articles",
				{
					description:
						"List Lightning Jar blog articles, newest first: slug, title, date, description, url.",
					inputSchema: z.object({}),
				},
				async () => text(await listBlogArticles(fetch)),
			);

			server.registerTool(
				"read_blog_article",
				{
					description:
						"Read one blog article by slug: full markdown body plus frontmatter essentials.",
					inputSchema: z.object({ slug: z.string().min(1) }),
				},
				async ({ slug }: { slug: string }) =>
					text(await readBlogArticle(fetch, slug)),
			);

			server.registerTool(
				"read_page",
				{
					description:
						"Read the full text of a studio overview page: about, services, testimonials, terms, fun, or built-with.",
					inputSchema: z.object({
						page: z.enum([
							"about",
							"services",
							"testimonials",
							"terms",
							"fun",
							"built-with",
						]),
					}),
				},
				async ({ page }: { page: Parameters<typeof readPage>[1] }) =>
					text(await readPage(fetch, page)),
			);

			server.registerTool(
				"list_customer_stories",
				{
					description:
						"List Lightning Jar customer stories in curated order: slug, title, customer, excerpt, url.",
					inputSchema: z.object({}),
				},
				async () => text(await listCustomerStories(fetch)),
			);

			server.registerTool(
				"read_customer_story",
				{
					description:
						"Read one customer story by slug: rendered body plus customer, testimonials, and technologies.",
					inputSchema: z.object({ slug: z.string().min(1) }),
				},
				async ({ slug }: { slug: string }) =>
					text(await readCustomerStory(fetch, slug)),
			);

			server.registerTool(
				"list_reading_list",
				{
					description:
						"List the Lightning Jar reading list, newest repost first: curated external articles with our summaries.",
					inputSchema: z.object({}),
				},
				async () => text(await listReadingList(fetch)),
			);

			server.registerTool(
				"list_packages",
				{
					description:
						"List Lightning Jar's open-source packages and tools (barkup, barkdown, woof-editor, barmark, …): name, npm package, status, tagline, links, url.",
					inputSchema: z.object({}),
				},
				() => text(listPackages()),
			);

			server.registerTool(
				"list_studies",
				{
					description:
						"List every study across Lightning Jar's pre-registered research projects (Barkup Bench: LLM tree editing; AEO Bench: agent readiness and answer engine optimization): project, letters, slug, track, title, one-line result, url.",
					inputSchema: z.object({}),
				},
				() => text(listStudies()),
			);

			server.registerTool(
				"read_study",
				{
					description:
						'Read one study by its short slug — the last path segment alone, e.g. "1" for /research/aeo-bench/1 or "ag" for /research/barkup-bench/ag (slugs are unique across projects): full section text (HTML stripped), chart titles, and source links.',
					inputSchema: z.object({ slug: z.string().min(1) }),
				},
				({ slug }: { slug: string }) => text(readStudy(slug)),
			);
		},
		{
			serverInfo: { name: "lightning-jar", version: "1.0.0" },
			// Stateless: reject subscriptions rather than opening an SSE
			// stream (mcp-handler 1's `disableSse` became this in 2.x).
			maxSubscriptions: 0,
		},
	);
}

// mcp-handler 2 dropped the handler-level `maxDuration`; on Vercel it is
// route config, which adapter-vercel reads from +server.ts. Runtime is
// inherited from the adapter default pinned in vite.config.ts.
export const config = { maxDuration: 60 };

const CORS = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "POST, GET, DELETE, OPTIONS",
	"Access-Control-Allow-Headers":
		"content-type, mcp-session-id, mcp-protocol-version",
};

// Anti-runaway fence, not anti-usage: a legitimate agent session makes
// 5-15 tool calls (AEO Bench Study 1 measured 2.7-4.9 fetches per
// task), and cloud-hosted agents share egress IPs, so the caps are
// generous. Upstash-backed when configured, in-memory per-instance
// otherwise (#lib/server/rateLimit).
const limiter = createRateLimiter({
	prefix: "rl:mcp",
	rules: [
		{ name: "ip", max: 60, windowSec: 300, scope: "ip" },
		{ name: "daily", max: 2_000, windowSec: 86_400, scope: "global" },
	],
	redisUrl: ENV.KV_REST_API_URL || undefined,
	redisToken: ENV.KV_REST_API_TOKEN || undefined,
});

export const POST: RequestHandler = async ({
	request,
	fetch,
	getClientAddress,
}) => {
	let ip = "unknown";
	try {
		ip = getClientAddress();
	} catch {
		// prerender/analysis contexts — keep the fallback key
	}
	const verdict = await limiter.check(ip);
	if (!verdict.ok) {
		// well-behaved MCP clients speak HTTP: 429 + Retry-After lets them
		// back off; the JSON-RPC error body keeps protocol clients readable
		return json(
			{
				jsonrpc: "2.0",
				id: null,
				error: {
					code: -32000,
					message: `Rate limited. Retry after ${verdict.retryAfterSec} seconds.`,
				},
			},
			{
				status: 429,
				headers: { ...CORS, "retry-after": String(verdict.retryAfterSec) },
			},
		);
	}

	const res = await handlerFor(fetch)(request);
	for (const [k, v] of Object.entries(CORS)) res.headers.set(k, v);
	return res;
};

// Stateless mode: no SSE stream to open and no session to delete, but
// clients probe both verbs — answer them honestly instead of 404ing.
export const GET: RequestHandler = async () =>
	json(
		{ error: "This MCP endpoint is stateless — use POST." },
		{ status: 405, headers: CORS },
	);

export const DELETE: RequestHandler = async () =>
	json({ ok: true, stateless: true }, { headers: CORS });

export const OPTIONS: RequestHandler = async () =>
	new Response(null, { status: 204, headers: CORS });
