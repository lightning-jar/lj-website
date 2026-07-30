import { json } from "@sveltejs/kit";
import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

// One shared tool layer serves both this public MCP endpoint and the
// concierge chat (/api/concierge) — the data functions live in
// $lib/server/agentTools so the two surfaces can never drift.
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
} from "$lib/server/agentTools";

import type { RequestHandler } from "./$types";

// Public, keyless, read-only MCP endpoint (streamable HTTP, stateless):
// everything it serves is already public on the site, so agent reach is
// maximized — the point of agent readiness. Discovery:
// /.well-known/mcp.json and /llms.txt.
export const prerender = false;

type Fetch = typeof globalThis.fetch;

function handlerFor(fetch: Fetch) {
	return createMcpHandler(
		(server) => {
			// The SDK's .tool() overload types resolve against zod v3 shapes;
			// the runtime supports zod v4 (peer ^3.25 || ^4.0). One cast
			// bridges the typings — args are validated by the SDK at runtime.
			const tool = server.tool.bind(server) as (
				name: string,
				description: string,
				schema: Record<string, unknown>,
				// biome-ignore lint/suspicious/noExplicitAny: SDK-validated args
				cb: (args: any) => Promise<unknown> | unknown,
			) => void;

			const text = (value: unknown) => ({
				content: [
					{ type: "text" as const, text: JSON.stringify(value, null, 2) },
				],
			});

			tool(
				"about_lightning_jar",
				"Who Lightning Jar is, what the studio does, and the site's key surfaces (research, playbook, packages, contact).",
				{},
				() => text(aboutLightningJar()),
			);

			tool(
				"search_content",
				"Search Lightning Jar's blog articles, customer stories, reading-list entries, technologies, and open-source packages by keyword. Every term must match somewhere in the title, description, summary, or tags.",
				{
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
				},
				async ({ query, collection }: { query: string; collection?: string }) =>
					text(await searchContent(fetch, query, collection)),
			);

			tool(
				"list_blog_articles",
				"List Lightning Jar blog articles, newest first: slug, title, date, description, url.",
				{},
				async () => text(await listBlogArticles(fetch)),
			);

			tool(
				"read_blog_article",
				"Read one blog article by slug: full markdown body plus frontmatter essentials.",
				{ slug: z.string().min(1) },
				async ({ slug }: { slug: string }) =>
					text(await readBlogArticle(fetch, slug)),
			);

			tool(
				"read_page",
				"Read the full text of a studio overview page: about, services, testimonials, terms, fun, or built-with.",
				{
					page: z.enum([
						"about",
						"services",
						"testimonials",
						"terms",
						"fun",
						"built-with",
					]),
				},
				async ({ page }: { page: Parameters<typeof readPage>[1] }) =>
					text(await readPage(fetch, page)),
			);

			tool(
				"list_customer_stories",
				"List Lightning Jar customer stories in curated order: slug, title, customer, excerpt, url.",
				{},
				async () => text(await listCustomerStories(fetch)),
			);

			tool(
				"read_customer_story",
				"Read one customer story by slug: rendered body plus customer, testimonials, and technologies.",
				{ slug: z.string().min(1) },
				async ({ slug }: { slug: string }) =>
					text(await readCustomerStory(fetch, slug)),
			);

			tool(
				"list_reading_list",
				"List the Lightning Jar reading list, newest repost first: curated external articles with our summaries.",
				{},
				async () => text(await listReadingList(fetch)),
			);

			tool(
				"list_packages",
				"List Lightning Jar's open-source packages and tools (barkup, barkdown, woof-editor, …): name, npm package, status, tagline, links, url.",
				{},
				() => text(listPackages()),
			);

			tool(
				"list_studies",
				"List every study across Lightning Jar's pre-registered research projects (Barkup Bench: LLM tree editing; AEO Bench: agent readiness and answer engine optimization): project, letters, slug, track, title, one-line result, url.",
				{},
				() => text(listStudies()),
			);

			tool(
				"read_study",
				"Read one study by slug (from either research project; slugs are unique): full section text (HTML stripped), chart titles, and source links.",
				{ slug: z.string().min(1) },
				({ slug }: { slug: string }) => text(readStudy(slug)),
			);
		},
		{ serverInfo: { name: "lightning-jar", version: "1.0.0" } },
		{ basePath: "", disableSse: true, maxDuration: 60 },
	);
}

const CORS = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "POST, GET, DELETE, OPTIONS",
	"Access-Control-Allow-Headers":
		"content-type, mcp-session-id, mcp-protocol-version",
};

export const POST: RequestHandler = async ({ request, fetch }) => {
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
