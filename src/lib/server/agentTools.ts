// Shared read-only site tools: one data layer, two consumers — the
// public MCP server (/mcp) serves them to visiting agents, and the
// concierge chat (/api/concierge) grounds its answers in them. Keeping
// a single module means the homepage agent is a live demonstration of
// the same surface we advertise to other agents, and the two can never
// drift. Everything here is public data; CMS keys stay server-side
// inside the getters.

import {
	getAllBlogArticles,
	getBlogArticleMarkdownBySlug,
} from "$content/getters/getBlogArticles";
import {
	getAllCustomerStories,
	getCustomerStoryMarkdownBySlug,
} from "$content/getters/getCustomerStories";
import { allPackages } from "$content/getters/getPackagesContent";
import { getAllReadingListArticles } from "$content/getters/getReadingList";
import { allTechnologies } from "$content/getters/getTechnologiesContent";

import aeoStudies from "../../routes/research/aeo-bench/aeo-studies.json";
import benchStudies from "../../routes/research/barkup-bench/bench-studies.json";
import { buildSiteIndex } from "./siteIndex";
import { createTtlCache } from "./ttlCache";
import { SITE_BASE } from "$data/siteBase";
import { ABOUT_LIGHTNING_JAR } from "$data/aboutLightningJar";


// In-instance TTL memos over the CMS fetches — the burst-cost lever: a
// run of tool calls (one agent session can make 5-15) hits the CMS once
// per collection per TTL, not once per call. 120s keeps the agent
// surfaces fresh while bounding what any burst, legitimate or abusive,
// can cost upstream. Negative results (missing slugs) cache too, which
// bounds repeated probing; thrown failures are never cached (ttlCache
// evicts rejections so transient CMS errors retry immediately).
const TTL_MS = 120_000;

// re-exported so the concierge's curated-index tests can reach it without
// importing this module (which pulls in import.meta.glob getters)
export { buildSiteIndex } from "./siteIndex";

type Fetch = typeof globalThis.fetch;

const cBlogList = createTtlCache<
	Awaited<ReturnType<typeof getAllBlogArticles>>
>({ ttlMs: TTL_MS, maxEntries: 1 });
const cStoryList = createTtlCache<
	Awaited<ReturnType<typeof getAllCustomerStories>>
>({ ttlMs: TTL_MS, maxEntries: 1 });
const cReadingList = createTtlCache<
	Awaited<ReturnType<typeof getAllReadingListArticles>>
>({ ttlMs: TTL_MS, maxEntries: 1 });
const cBlogRead = createTtlCache<
	Awaited<ReturnType<typeof getBlogArticleMarkdownBySlug>>
>({ ttlMs: TTL_MS, maxEntries: 300 });
const cStoryRead = createTtlCache<
	Awaited<ReturnType<typeof getCustomerStoryMarkdownBySlug>>
>({ ttlMs: TTL_MS, maxEntries: 100 });

const blogArticles = (fetch: Fetch) =>
	cBlogList.get("all", () => getAllBlogArticles(fetch));
const customerStories = (fetch: Fetch) =>
	cStoryList.get("all", () => getAllCustomerStories(fetch));
const readingList = (fetch: Fetch) =>
	cReadingList.get("all", () => getAllReadingListArticles(fetch));

const stripHtml = (s: string) => s.replace(/<[^>]+>/g, "");

export function aboutLightningJar() {
	return ABOUT_LIGHTNING_JAR;
}

export async function searchContent(
	fetch: Fetch,
	query: string,
	collection?: string,
) {
	const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
	const matches = (haystack: string) =>
		terms.every((t) => haystack.toLowerCase().includes(t));
	const out: unknown[] = [];
	if (!collection || collection === "blog") {
		for (const a of await blogArticles(fetch)) {
			const fm = a.frontMatter;
			const hay = [fm.title, fm.description, ...(fm.tags ?? [])].join(" ");
			if (matches(hay))
				out.push({
					type: "blog",
					slug: fm.slug,
					title: fm.title,
					description: fm.description,
					url: `${SITE_BASE}/blog/${fm.slug}`,
				});
		}
	}
	if (!collection || collection === "customer-story") {
		for (const s of await customerStories(fetch)) {
			const hay = [s.title, s.excerpt, ...(s.tags ?? [])].join(" ");
			if (matches(hay))
				out.push({
					type: "customer-story",
					slug: s.slug,
					title: s.title,
					excerpt: s.excerpt,
					url: `${SITE_BASE}/customer-stories/${s.slug}`,
				});
		}
	}
	if (!collection || collection === "reading-list") {
		for (const e of await readingList(fetch)) {
			const hay = [e.title, e.summary, e.excerpt, ...(e.tags ?? [])].join(" ");
			if (matches(hay))
				out.push({
					type: "reading-list",
					slug: e.slug,
					title: e.title,
					excerpt: e.excerpt,
					url: `${SITE_BASE}/reading-list/${e.slug}`,
					sourceUrl: e.url,
				});
		}
	}
	if (!collection || collection === "technology") {
		for (const t of allTechnologies) {
			const hay = [t.name, t.category, t.shortDescription ?? ""].join(" ");
			if (matches(hay))
				out.push({
					type: "technology",
					id: t.id,
					name: t.name,
					category: t.category,
					description: t.shortDescription,
					url: `${SITE_BASE}/technologies/${t.id}`,
				});
		}
	}
	if (!collection || collection === "package") {
		for (const p of allPackages) {
			const hay = [p.name, p.npmName ?? "", p.category, p.tagline].join(" ");
			if (matches(hay))
				out.push({
					type: "package",
					id: p.id,
					name: p.name,
					npm: p.npmName,
					category: p.category,
					status: p.status,
					description: p.tagline,
					links: p.links,
					url: `${SITE_BASE}/packages/${p.id}`,
				});
		}
	}
	return { total: out.length, results: out };
}

export async function listBlogArticles(fetch: Fetch) {
	return (await blogArticles(fetch)).map((a) => ({
		slug: a.frontMatter.slug,
		title: a.frontMatter.title,
		date: a.frontMatter.date,
		description: a.frontMatter.description,
		tags: a.frontMatter.tags,
		url: `${SITE_BASE}/blog/${a.frontMatter.slug}`,
	}));
}

export async function readBlogArticle(fetch: Fetch, slug: string) {
	// return the raw markdown body, not rendered HTML: AEO Bench Study 1
	// measured markdown saving 20-74% of the tokens HTML costs an agent,
	// and we publish barkdown — no reason to feed our own agent HTML.
	const detail = await cBlogRead.get(slug, () =>
		getBlogArticleMarkdownBySlug(fetch, slug),
	);
	if (!detail) return { error: `No article with slug "${slug}"` };
	const fm = detail.frontMatter;
	return {
		slug: fm.slug,
		title: fm.title,
		date: fm.date,
		author: fm.author,
		description: fm.description,
		tags: fm.tags,
		url: `${SITE_BASE}/blog/${fm.slug}`,
		markdown: detail.markdown,
	};
}

export async function listCustomerStories(fetch: Fetch) {
	return (await customerStories(fetch)).map((s) => ({
		slug: s.slug,
		title: s.title,
		customer: s.customer?.name,
		excerpt: s.excerpt,
		tags: s.tags,
		url: `${SITE_BASE}/customer-stories/${s.slug}`,
	}));
}

export async function readCustomerStory(fetch: Fetch, slug: string) {
	// markdown body + the structured frontmatter fields (customer,
	// testimonials) — lean tokens per the AEO Bench markdown finding
	const detail = await cStoryRead.get(slug, () =>
		getCustomerStoryMarkdownBySlug(fetch, slug),
	);
	if (!detail) return { error: `No story with slug "${slug}"` };
	const fm = detail.frontMatter;
	return {
		slug: fm.slug,
		title: fm.title,
		customer: fm.customer,
		excerpt: fm.excerpt,
		testimonials: fm.testimonials,
		url: `${SITE_BASE}/customer-stories/${fm.slug}`,
		markdown: detail.markdown,
	};
}

export async function listReadingList(fetch: Fetch) {
	return (await readingList(fetch)).map((e) => ({
		slug: e.slug,
		title: e.title,
		author: e.author?.name,
		publication: e.source?.publicationName,
		summary: e.summary,
		ourPage: `${SITE_BASE}/reading-list/${e.slug}`,
		sourceUrl: e.url,
	}));
}

// The overview/marketing pages no other tool exposes. Without this the
// concierge is blind to its own studio's services/about/etc content and
// — per AEO Bench Study 2 — would confidently declare it nonexistent.
// Enum-constrained (no arbitrary fetch); content is read from the
// rendered page and stripped to text.
export const SITE_PAGES = {
	about: "/about",
	services: "/services",
	testimonials: "/testimonials",
	terms: "/terms",
	fun: "/fun",
	"built-with": "/built-with",
} as const;

export type SitePageKey = keyof typeof SITE_PAGES;

const cPage = createTtlCache<Awaited<ReturnType<typeof fetchPage>>>({
	ttlMs: TTL_MS,
	maxEntries: 12,
});

export async function readPage(fetch: Fetch, page: SitePageKey) {
	if (!SITE_PAGES[page]) return { error: `Unknown page "${page}"` };
	return cPage.get(page, () => fetchPage(fetch, page));
}

async function fetchPage(fetch: Fetch, page: SitePageKey) {
	const path = SITE_PAGES[page];
	const url = `${SITE_BASE}${path}`;
	let res: Response;
	try {
		// ask for markdown first: AEO Bench Study 1 measured markdown saving
		// 20-74% of the tokens HTML costs an agent, and this site negotiates
		// it (hooks.server.ts). Pages that don't negotiate just return HTML,
		// which we strip below as before.
		res = await fetch(url, { headers: { accept: "text/markdown" } });
		if (!res.ok) return { error: `Page "${page}" returned ${res.status}` };
	} catch {
		return { error: `Could not load page "${page}"` };
	}
	if ((res.headers.get("content-type") ?? "").includes("text/markdown")) {
		const markdown = (await res.text()).slice(0, 6_000);
		return { page, url, markdown };
	}
	// fallback: main content only, tags stripped, whitespace collapsed, capped
	const html = await res.text();
	const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? html;
	const text = main
		.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ")
		.replace(/<[^>]+>/g, " ")
		.replace(/&nbsp;/g, " ")
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&#39;/g, "'")
		.replace(/&quot;/g, '"')
		.replace(/\s+/g, " ")
		.trim()
		.slice(0, 6_000);
	return { page, url, text };
}

export function listPackages() {
	return allPackages.map((p) => ({
		id: p.id,
		name: p.name,
		npm: p.npmName,
		status: p.status,
		category: p.category,
		tagline: p.tagline,
		links: p.links,
		url: `${SITE_BASE}/packages/${p.id}`,
	}));
}

// both research projects share the study tools; slugs are unique
// across projects (barkup studies use letters, aeo studies use numbers)
// so readStudy needs no project argument
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

export function listStudies() {
	return projects.flatMap(({ project, studies }) =>
		studies.map((s) => ({
			project,
			letters: s.letters,
			slug: s.slug,
			track: s.track,
			title: s.title,
			result: s.indexLine,
			url: `${SITE_BASE}/research/${project}/${s.slug}`,
		})),
	);
}

export function readStudy(slug: string) {
	// Agents guess path-shaped slugs ("aeo-bench/1", "/research/barkup-bench/ag",
	// or the full URL) because the site index lists studies as paths — observed
	// in production chat logs burning 4 of 6 tool steps on retries. Normalize
	// to the last path segment; slugs are unique across projects, so the
	// segment alone is unambiguous.
	const normalized =
		slug.trim().toLowerCase().split("/").filter(Boolean).pop() ?? "";
	for (const { project, studies, briefUrl } of projects) {
		const study = studies.find((s) => s.slug === normalized);
		if (!study) continue;
		return {
			project,
			letters: study.letters,
			track: study.track,
			title: study.title,
			url: `${SITE_BASE}/research/${project}/${study.slug}`,
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
		};
	}
	return {
		error: `No study with slug "${slug}". Use the short study identifier alone — the last segment of /research/<project>/<slug> — e.g. "1" for AEO Bench Study 1 or "ag" for Barkup Bench Study AG.`,
	};
}

// The curated site index (AEO Bench Study 3), built ONCE per server
// process and cached: the blog/reading counts are fetched from the CMS on
// the first call and the rendered string is reused thereafter, so it is
// byte-stable within a process — required for the prompt-cache breakpoint
// in the concierge route. A failed first build resets the cache so a
// later request retries rather than serving a permanently empty index.
let _siteIndex: Promise<string> | null = null;
export function siteIndex(fetch: Fetch): Promise<string> {
	if (!_siteIndex) {
		_siteIndex = (async () => {
			const [blog, reading] = await Promise.all([
				blogArticles(fetch),
				readingList(fetch),
			]);
			return buildSiteIndex({
				blogArticles: blog.length,
				readingListEntries: reading.length,
				packages: allPackages.map((p) => ({ name: p.name, id: p.id })),
			});
		})();
		_siteIndex.catch(() => {
			_siteIndex = null;
		});
	}
	return _siteIndex;
}
