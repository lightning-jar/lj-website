// Blog content lives in the replicator CMS (Lightning Jar org) and is
// fetched at request time via the org-scoped public API — blog routes,
// feeds, and sitemaps are server-rendered with edge caching so CMS
// saves go live without a redeploy (matching slx-web). Markdown is
// still parsed locally by $utils/parseMarkdown so published HTML stays
// bit-identical to the git-content era.

// utils
import { matchAuthorProfile } from "$utils/authorMatch";
import { parseMarkdownTextToHtml } from "$utils/parseMarkdown";

// types
import type { FrontMatter } from "$types/FrontMatter";
import type { SitemapPage, SitemapSection } from "$types/Sitemap";

// env
import { ENV } from "varlock/env";

type Fetch = typeof globalThis.fetch;

interface ApiArticleListItem {
	slug: string;
	title: string;
	author: string | null;
	articleDate: string | null;
	publishedAt: string | null;
	featured: boolean;
	featuredOrder: number | null;
	imageUrl: string | null;
	frontMatter: FrontMatter;
}

interface ApiArticleDetail extends ApiArticleListItem {
	markdown: string;
}

export interface BlogArticleListEntry {
	frontMatter: FrontMatter;
}

export interface BlogArticleDetail {
	frontMatter: FrontMatter;
	html: string;
	nextArticleSlug?: string;
	previousArticleSlug?: string;
}

function apiBase(): string {
	const value = ENV.BLOG_CMS_BASE_URL;
	if (!value) throw new Error("BLOG_CMS_BASE_URL is not set");
	return value.replace(/\/$/, "");
}

function authHeaders(): HeadersInit {
	const key = ENV.BLOG_API_KEY;
	if (!key) throw new Error("BLOG_API_KEY is not set");
	return { "x-api-key": key };
}

// Pass SvelteKit's `event.fetch` from the caller's load/GET so caching
// and origin propagation work; `cache: "force-cache"` lets Vercel's
// edge layer participate per the CMS contract.
async function fetchArticleList(fetch: Fetch): Promise<ApiArticleListItem[]> {
	const res = await fetch(`${apiBase()}/api/public/blog/articles?limit=200`, {
		headers: authHeaders(),
		cache: "force-cache",
	});
	if (!res.ok) throw new Error(`Blog list fetch failed: ${res.status}`);
	const data = (await res.json()) as { articles: ApiArticleListItem[] };
	return data.articles;
}

// get array of blog articles frontMatter, newest first (same date-desc
// ordering the git-content getter produced; same-date articles fall
// back to slug order, matching the old filename-order glob)
export async function getAllBlogArticles(
	fetch: Fetch,
): Promise<BlogArticleListEntry[]> {
	const list = await fetchArticleList(fetch);
	const articles = list.map((item) => ({ frontMatter: item.frontMatter }));
	return articles.sort((a, b) => {
		const dateA = new Date(
			a.frontMatter?.date && typeof a.frontMatter.date === "string"
				? a.frontMatter.date
				: "",
		);
		const dateB = new Date(
			b.frontMatter?.date && typeof b.frontMatter.date === "string"
				? b.frontMatter.date
				: "",
		);
		const byDate = dateB.getTime() - dateA.getTime();
		if (byDate !== 0) return byDate;
		const slugA =
			typeof a.frontMatter?.slug === "string" ? a.frontMatter.slug : "";
		const slugB =
			typeof b.frontMatter?.slug === "string" ? b.frontMatter.slug : "";
		return slugA.localeCompare(slugB);
	});
}

// get array of article slugs
export async function getAllBlogArticleSlugs(fetch: Fetch): Promise<string[]> {
	const articles = await getAllBlogArticles(fetch);
	return articles
		.map((article) => article.frontMatter?.slug || "")
		.filter(Boolean) as string[];
}

// raw markdown + frontmatter, for agent content negotiation
// (Accept: text/markdown — see hooks.server.ts)
export async function getBlogArticleMarkdownBySlug(
	fetch: Fetch,
	slug: string,
): Promise<{ frontMatter: FrontMatter; markdown: string } | undefined> {
	if (!slug) return undefined;
	const res = await fetch(
		`${apiBase()}/api/public/blog/articles/${encodeURIComponent(slug)}`,
		{ headers: authHeaders(), cache: "force-cache" },
	);
	if (res.status === 404) return undefined;
	if (!res.ok) throw new Error(`Blog article fetch failed: ${res.status}`);
	const data = (await res.json()) as { article: ApiArticleDetail };
	return {
		frontMatter: data.article.frontMatter,
		markdown: data.article.markdown,
	};
}

// get one article with locally-parsed html + next/previous slugs.
// next/previous are derived from the newest-first list (same as the
// git-content era) rather than the API's nextSlug/previousSlug, whose
// strict publishedAt comparison skips same-timestamp siblings.
export async function getBlogArticleBySlug(
	fetch: Fetch,
	slug: string,
): Promise<BlogArticleDetail | undefined> {
	if (!slug) return undefined;
	const slugs = await getAllBlogArticleSlugs(fetch);
	const index = slugs.indexOf(slug);
	if (index === -1) return undefined;
	const res = await fetch(
		`${apiBase()}/api/public/blog/articles/${encodeURIComponent(slug)}`,
		{ headers: authHeaders(), cache: "force-cache" },
	);
	if (res.status === 404) return undefined;
	if (!res.ok) throw new Error(`Blog article fetch failed: ${res.status}`);
	const data = (await res.json()) as { article: ApiArticleDetail };
	return {
		frontMatter: data.article.frontMatter,
		html: parseMarkdownTextToHtml({
			markdown: data.article.markdown,
			options: { sanitize: true, lazyImages: true },
		}),
		nextArticleSlug: slugs[index + 1],
		previousArticleSlug: index > 0 ? slugs[index - 1] : undefined,
	};
}

// for human readable sitemap
export async function getBlogArticlesSitemapSection(
	fetch: Fetch,
): Promise<SitemapSection> {
	const articles = await getAllBlogArticles(fetch);
	const pages: SitemapPage[] = articles.map((article) => {
		return {
			title:
				article.frontMatter?.metaTitle &&
				typeof article.frontMatter.metaTitle === "string"
					? article.frontMatter.metaTitle
					: "",
			description:
				article.frontMatter?.description &&
				typeof article.frontMatter.description === "string"
					? article.frontMatter.description
					: "",
			date:
				article.frontMatter?.date &&
				typeof article.frontMatter.date === "string"
					? article.frontMatter.date
					: "",
			href:
				article.frontMatter?.slug &&
				typeof article.frontMatter.slug === "string"
					? `/blog/${article.frontMatter.slug}`
					: "",
		};
	});
	const landing = {
		title: "Blog",
		description: "Read our latest blog posts",
		date: new Date().toISOString(),
		href: "/blog",
	};
	return {
		name: "Blog",
		pages: [landing, ...pages],
	};
}

// ---- Authors ---------------------------------------------------------

export interface BlogAuthorProfile {
	name: string;
	title: string;
	organization: string;
	imageUrl: string | null;
}

// The org's author catalog from the CMS (name, title, organization,
// headshot) — drives the article attribution section. Same caching
// contract as the article fetches.
export async function getBlogAuthorCatalog(
	fetch: Fetch,
): Promise<BlogAuthorProfile[]> {
	const res = await fetch(`${apiBase()}/api/public/blog/authors`, {
		headers: authHeaders(),
		cache: "force-cache",
	});
	if (!res.ok) throw new Error(`Blog authors fetch failed: ${res.status}`);
	const data = (await res.json()) as { authors: BlogAuthorProfile[] };
	return data.authors;
}

// Resolve an article's frontmatter `author` string to a catalog
// profile. The editor writes either a bare name ("Kevin Peckham") or
// the canonical "Name | Title, Org" byline — match on the name part.
// Returns null when unknown (the page then renders no author section,
// matching the old behavior for unmatched authors).
export async function getBlogAuthorProfile(
	fetch: Fetch,
	author: string | null | undefined,
): Promise<BlogAuthorProfile | null> {
	try {
		return matchAuthorProfile(await getBlogAuthorCatalog(fetch), author);
	} catch {
		// The author section is decorative — never fail the page over it.
		return null;
	}
}
