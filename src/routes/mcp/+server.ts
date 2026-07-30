import { json } from "@sveltejs/kit";
import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

// content getters (CMS keys stay server-side; agents never see them)
import {
	getAllBlogArticles,
	getBlogArticleBySlug,
} from "$content/getters/getBlogArticles";
import {
	getAllCustomerStories,
	getCustomerStoryBySlug,
} from "$content/getters/getCustomerStories";
import { getAllReadingListArticles } from "$content/getters/getReadingList";

// research data (git-resident)
import aeoStudies from "../research/aeo-bench/aeo-studies.json";
import benchStudies from "../research/barkup-bench/bench-studies.json";

import type { RequestHandler } from "./$types";

// Public, keyless, read-only MCP endpoint (streamable HTTP, stateless):
// everything it serves is already public on the site, so agent reach is
// maximized — the point of agent readiness. Discovery:
// /.well-known/mcp.json and /llms.txt.
export const prerender = false;

const BASE = "https://www.lightningjar.com";

const stripHtml = (s: string) => s.replace(/<[^>]+>/g, "");

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
				() =>
					text({
						name: "Lightning Jar",
						founded: 2001,
						summary:
							"Design, build, and brand technology studio. Websites, web applications, and custom software for business clients; open LLM research (Barkup Bench, AEO Bench) and open-source libraries (barkup, barkdown, woof-editor); AI-era marketing technology including Replicator, an LLM-powered brand operating system.",
						contact: "hello@lightningjar.com",
						surfaces: {
							blog: `${BASE}/blog`,
							customerStories: `${BASE}/customer-stories`,
							readingList: `${BASE}/reading-list`,
							research: `${BASE}/research/barkup-bench`,
							aeoResearch: `${BASE}/research/aeo-bench`,
							playbook: `${BASE}/research/barkup-bench/playbook`,
							services: `${BASE}/services`,
						},
						packages: [
							"https://github.com/kevinpeckham/barkup",
							"https://github.com/kevinpeckham/barkup-bench",
							"https://github.com/kevinpeckham/barkdown",
						"https://github.com/kevinpeckham/aeo-bench",
						],
					}),
			);

			tool(
				"search_content",
				"Search Lightning Jar's blog articles, customer stories, and reading-list entries by keyword. Every term must match somewhere in the title, description, summary, or tags.",
				{
					query: z.string().min(1).describe("Search terms, space-separated"),
					collection: z
						.enum(["blog", "customer-story", "reading-list"])
						.optional()
						.describe("Restrict to one collection"),
				},
				async ({
					query,
					collection,
				}: {
					query: string;
					collection?: string;
				}) => {
					const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
					const matches = (haystack: string) =>
						terms.every((t) => haystack.toLowerCase().includes(t));
					const out: unknown[] = [];
					if (!collection || collection === "blog") {
						for (const a of await getAllBlogArticles(fetch)) {
							const fm = a.frontMatter;
							const hay = [fm.title, fm.description, ...(fm.tags ?? [])].join(
								" ",
							);
							if (matches(hay))
								out.push({
									type: "blog",
									slug: fm.slug,
									title: fm.title,
									description: fm.description,
									url: `${BASE}/blog/${fm.slug}`,
								});
						}
					}
					if (!collection || collection === "customer-story") {
						for (const s of await getAllCustomerStories(fetch)) {
							const hay = [s.title, s.excerpt, ...(s.tags ?? [])].join(" ");
							if (matches(hay))
								out.push({
									type: "customer-story",
									slug: s.slug,
									title: s.title,
									excerpt: s.excerpt,
									url: `${BASE}/customer-stories/${s.slug}`,
								});
						}
					}
					if (!collection || collection === "reading-list") {
						for (const e of await getAllReadingListArticles(fetch)) {
							const hay = [
								e.title,
								e.summary,
								e.excerpt,
								...(e.tags ?? []),
							].join(" ");
							if (matches(hay))
								out.push({
									type: "reading-list",
									slug: e.slug,
									title: e.title,
									excerpt: e.excerpt,
									url: `${BASE}/reading-list/${e.slug}`,
									sourceUrl: e.url,
								});
						}
					}
					return text({ total: out.length, results: out });
				},
			);

			tool(
				"list_blog_articles",
				"List Lightning Jar blog articles, newest first: slug, title, date, description, url.",
				{},
				async () =>
					text(
						(await getAllBlogArticles(fetch)).map((a) => ({
							slug: a.frontMatter.slug,
							title: a.frontMatter.title,
							date: a.frontMatter.date,
							description: a.frontMatter.description,
							tags: a.frontMatter.tags,
							url: `${BASE}/blog/${a.frontMatter.slug}`,
						})),
					),
			);

			tool(
				"read_blog_article",
				"Read one blog article by slug: full markdown body plus frontmatter essentials.",
				{ slug: z.string().min(1) },
				async ({ slug }: { slug: string }) => {
					const detail = await getBlogArticleBySlug(fetch, slug);
					if (!detail) return text({ error: `No article with slug "${slug}"` });
					const fm = detail.frontMatter;
					return text({
						slug: fm.slug,
						title: fm.title,
						date: fm.date,
						author: fm.author,
						description: fm.description,
						tags: fm.tags,
						url: `${BASE}/blog/${fm.slug}`,
						html: detail.html,
					});
				},
			);

			tool(
				"list_customer_stories",
				"List Lightning Jar customer stories in curated order: slug, title, customer, excerpt, url.",
				{},
				async () =>
					text(
						(await getAllCustomerStories(fetch)).map((s) => ({
							slug: s.slug,
							title: s.title,
							customer: s.customer?.name,
							excerpt: s.excerpt,
							tags: s.tags,
							url: `${BASE}/customer-stories/${s.slug}`,
						})),
					),
			);

			tool(
				"read_customer_story",
				"Read one customer story by slug: rendered body plus customer, testimonials, and technologies.",
				{ slug: z.string().min(1) },
				async ({ slug }: { slug: string }) => {
					const story = await getCustomerStoryBySlug(fetch, slug);
					if (!story) return text({ error: `No story with slug "${slug}"` });
					return text({
						slug: story.slug,
						title: story.title,
						customer: story.customer,
						excerpt: story.excerpt,
						testimonials: story.testimonials,
						technologies: story.technologies?.map((t) => t.name),
						url: `${BASE}/customer-stories/${story.slug}`,
						html: story.html,
					});
				},
			);

			tool(
				"list_reading_list",
				"List the Lightning Jar reading list, newest repost first: curated external articles with our summaries.",
				{},
				async () =>
					text(
						(await getAllReadingListArticles(fetch)).map((e) => ({
							slug: e.slug,
							title: e.title,
							author: e.author?.name,
							publication: e.source?.publicationName,
							summary: e.summary,
							ourPage: `${BASE}/reading-list/${e.slug}`,
							sourceUrl: e.url,
						})),
					),
			);

			// both research projects share the study tools; slugs are unique
			// across projects (barkup studies use letters, aeo studies use
			// numbers) so read_study needs no project argument
			interface StudySection {
				title: string;
				figure?: { title?: string } | null;
				body?: { heading?: string | null; html: string }[] | null;
				takeaway?: string | null;
			}
			interface StudySource {
				letters: string;
				slug: string;
				track: string;
				title: string;
				indexLine: string;
				brief?: string | null;
				sections: StudySection[];
			}
			const projects: {
				project: string;
				studies: StudySource[];
				briefUrl: (brief: string) => string;
			}[] = [
				{
					project: "barkup-bench",
					studies: benchStudies.studies,
					briefUrl: (brief) =>
						`https://github.com/kevinpeckham/barkup-bench/blob/main/docs/${brief}`,
				},
				{
					project: "aeo-bench",
					studies: aeoStudies.studies,
					briefUrl: (brief) =>
						`https://github.com/kevinpeckham/aeo-bench/blob/main/${brief}`,
				},
			];

			tool(
				"list_studies",
				"List every study across Lightning Jar's pre-registered research projects (Barkup Bench: LLM tree editing; AEO Bench: agent readiness and answer engine optimization): project, letters, slug, track, title, one-line result, url.",
				{},
				() =>
					text(
						projects.flatMap(({ project, studies }) =>
							studies.map((s) => ({
								project,
								letters: s.letters,
								slug: s.slug,
								track: s.track,
								title: s.title,
								result: s.indexLine,
								url: `${BASE}/research/${project}/${s.slug}`,
							})),
						),
					),
			);

			tool(
				"read_study",
				"Read one study by slug (from either research project; slugs are unique): full section text (HTML stripped), chart titles, and source links.",
				{ slug: z.string().min(1) },
				({ slug }: { slug: string }) => {
					for (const { project, studies, briefUrl } of projects) {
						const study = studies.find((s) => s.slug === slug);
						if (!study) continue;
						return text({
							project,
							letters: study.letters,
							track: study.track,
							title: study.title,
							url: `${BASE}/research/${project}/${study.slug}`,
							preRegistration: study.brief ? briefUrl(study.brief) : null,
							sections: study.sections.map((sec) => ({
								title: stripHtml(sec.title),
								chart:
									sec.figure && "title" in sec.figure
										? (sec.figure.title ?? null)
										: null,
								text: sec.body
									? sec.body
											.map((c) =>
												[c.heading, stripHtml(c.html)].filter(Boolean).join(": "),
											)
											.join("\n\n")
									: stripHtml(sec.takeaway ?? ""),
							})),
						});
					}
					return text({ error: `No study with slug "${slug}"` });
				},
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
