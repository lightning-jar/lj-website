// Reading-list entries live in the replicator CMS (Lightning Jar org,
// collection "reading-list", Reading List blog entity) and are fetched
// at request time via the org-scoped public API. Entries are pure
// metadata: everything rides in frontmatter and the markdown body is
// empty, so there is no parseMarkdown step and no detail fetch — the
// list endpoint carries the complete entry.

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

// for human readable sitemap — static: the reading list has no
// per-entry pages, so the section is just the landing link
function buildHumanSitemapSection() {
	const landing = {
		title: "Reading List",
		description: "Things we read and recommend.",
		date: "",
		href: "/reading-list",
	};
	const section: SitemapSection = {
		name: "Reading List",
		pages: [landing],
	};
	return section;
}

export const readingListSitemapSection = buildHumanSitemapSection();
