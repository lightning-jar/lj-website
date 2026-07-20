// Reading-list entries live in the replicator CMS (Lightning Jar org,
// collection "reading-list", Reading List blog entity) and are fetched
// at request time via the org-scoped public API. Entries are pure
// metadata: everything rides in frontmatter and the markdown body is
// empty, so there is no parseMarkdown step — both the list and detail
// fetches return complete entries.

// env
import { ENV } from "varlock/env";

// types
import type { Article } from "$types/Article";
import type { SitemapSection } from "$types/Sitemap";

type Fetch = typeof globalThis.fetch;

interface ApiArticleListItem {
	slug: string;
	title: string;
	frontMatter: Article;
}

function apiBase(): string {
	const value = ENV.BLOG_CMS_BASE_URL;
	if (!value) throw new Error("BLOG_CMS_BASE_URL is not set");
	return value.replace(/\/$/, "");
}

function authHeaders(): HeadersInit {
	const key = ENV.READING_LIST_API_KEY;
	if (!key) throw new Error("READING_LIST_API_KEY is not set");
	return { "x-api-key": key };
}

// all entries, newest repost first (same ordering the git-content
// getter produced)
export async function getAllReadingListArticles(
	fetch: Fetch,
): Promise<Article[]> {
	const res = await fetch(
		`${apiBase()}/api/public/blog/articles?collection=reading-list&limit=200`,
		{ headers: authHeaders(), cache: "force-cache" },
	);
	if (!res.ok) throw new Error(`Reading list fetch failed: ${res.status}`);
	const data = (await res.json()) as { articles: ApiArticleListItem[] };
	return data.articles
		.map((item) => item.frontMatter)
		.sort((a, b) => {
			if (!a.repostDate || !b.repostDate) return 0;
			return b.repostDate.localeCompare(a.repostDate);
		});
}

export async function getReadingListArticleBySlug(
	fetch: Fetch,
	slug: string,
): Promise<Article | undefined> {
	if (!slug) return undefined;
	const res = await fetch(
		`${apiBase()}/api/public/blog/articles/${encodeURIComponent(slug)}?collection=reading-list`,
		{ headers: authHeaders(), cache: "force-cache" },
	);
	if (res.status === 404) return undefined;
	if (!res.ok)
		throw new Error(`Reading list entry fetch failed: ${res.status}`);
	const data = (await res.json()) as { article: ApiArticleListItem };
	return data.article.frontMatter;
}

export async function getAllReadingListSlugs(fetch: Fetch): Promise<string[]> {
	const articles = await getAllReadingListArticles(fetch);
	return articles.map((a) => a.slug || "").filter(Boolean);
}

// for human readable sitemap
export async function getReadingListSitemapSection(
	fetch: Fetch,
): Promise<SitemapSection> {
	const articles = await getAllReadingListArticles(fetch);
	const pages = articles.map((a) => ({
		title: a.metaTitle || a.title || "",
		description: a.description || "",
		date: "",
		href: a.slug ? `/reading-list/${a.slug}` : "",
	}));
	const landing = {
		title: "Reading List",
		description: "Things we read and recommend.",
		date: "",
		href: "/reading-list",
	};
	const section: SitemapSection = {
		name: "Reading List",
		pages: [landing, ...pages],
	};
	return section;
}
