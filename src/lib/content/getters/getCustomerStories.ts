// Customer stories live in the replicator CMS (Lightning Jar org,
// collection "customer-story", Customer Stories blog entity) and are
// fetched at request time via the org-scoped public API. The markdown
// body is parsed locally by $utils/parseMarkdown; structured fields
// (banner, testimonials, perspectives, images, …) ride in frontmatter.
// Stories sort by frontmatter `date`, newest first (since 2026-07-21;
// the former curated `order` field is retired — dates were assigned to
// reproduce its sequence). Technology enrichment stays local: `technologies`
// content remains in git.

// env
import { ENV } from "varlock/env";

// utils
import { parseMarkdownTextToHtml } from "$utils/parseMarkdown";

// data
import { allTechnologies } from "$content/getters/getTechnologiesContent";

// types
import type { CustomerStory } from "$types/CustomerStory";
import type { SitemapPage, SitemapSection } from "$types/Sitemap";

type Fetch = typeof globalThis.fetch;

interface ApiArticleListItem {
	slug: string;
	title: string;
	frontMatter: CustomerStory;
}

interface ApiArticleDetail extends ApiArticleListItem {
	markdown: string;
}

function apiBase(): string {
	const value = ENV.BLOG_CMS_BASE_URL;
	if (!value) throw new Error("BLOG_CMS_BASE_URL is not set");
	return value.replace(/\/$/, "");
}

function authHeaders(): HeadersInit {
	const key = ENV.CUSTOMER_STORIES_API_KEY;
	if (!key) throw new Error("CUSTOMER_STORIES_API_KEY is not set");
	return { "x-api-key": key };
}

// The CMS is moving story SEO fields to top-level `metaTitle` /
// `description` (aligning customer stories with the editor's surfaced
// fields); legacy payloads carry a nested `meta: {title, description}`.
// Normalize both shapes into the `meta: PageMeta` object the rest of
// the site (layout head, sitemaps) already consumes — top-level fields
// win when both are present.
function normalizeMeta(story: CustomerStory): CustomerStory {
	const raw = story as CustomerStory & {
		metaTitle?: string | null;
		description?: string | null;
	};
	const title = raw.metaTitle ?? story.meta?.title ?? story.title ?? null;
	const description = raw.description ?? story.meta?.description ?? null;
	return { ...story, meta: { ...(story.meta ?? {}), description, title } };
}

function enrichTechnologies(story: CustomerStory): CustomerStory {
	const ids = story.featuredTechnologies;
	if (!Array.isArray(ids) || ids.length === 0) {
		return { ...story, technologies: [] };
	}

	const technologies = ids.map((id) => {
		const tech = allTechnologies.find((t) => t.id === id);
		if (!tech) {
			console.warn(`Technology with id ${id} not found`);
		}
		return {
			id: tech?.id ?? "",
			name: tech?.name ?? "",
			logo: tech?.logo,
			link: tech?.link,
		};
	});

	return { ...story, technologies };
}

// all stories (list shape, no html), date-desc sorted + enriched
export async function getAllCustomerStories(
	fetch: Fetch,
): Promise<CustomerStory[]> {
	const res = await fetch(
		`${apiBase()}/api/public/blog/articles?collection=customer-story&limit=200`,
		{ headers: authHeaders(), cache: "force-cache" },
	);
	if (!res.ok) throw new Error(`Customer stories fetch failed: ${res.status}`);
	const data = (await res.json()) as { articles: ApiArticleListItem[] };
	return data.articles
		.map((item) => enrichTechnologies(normalizeMeta(item.frontMatter)))
		.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}

export async function getAllCustomerStorySlugs(
	fetch: Fetch,
): Promise<string[]> {
	const stories = await getAllCustomerStories(fetch);
	return stories.map((story) => story?.slug || "").filter(Boolean);
}

// raw markdown + normalized frontmatter, for agent content negotiation
// (Accept: text/markdown — see hooks.server.ts)
export async function getCustomerStoryMarkdownBySlug(
	fetch: Fetch,
	slug: string,
): Promise<{ frontMatter: CustomerStory; markdown: string } | undefined> {
	if (!slug) return undefined;
	const res = await fetch(
		`${apiBase()}/api/public/blog/articles/${encodeURIComponent(slug)}?collection=customer-story`,
		{ headers: authHeaders(), cache: "force-cache" },
	);
	if (res.status === 404) return undefined;
	if (!res.ok) throw new Error(`Customer story fetch failed: ${res.status}`);
	const data = (await res.json()) as { article: ApiArticleDetail };
	return {
		frontMatter: normalizeMeta(data.article.frontMatter),
		markdown: data.article.markdown,
	};
}

export async function getCustomerStoryBySlug(
	fetch: Fetch,
	slug: string,
): Promise<CustomerStory | undefined> {
	if (!slug) return undefined;
	const res = await fetch(
		`${apiBase()}/api/public/blog/articles/${encodeURIComponent(slug)}?collection=customer-story`,
		{ headers: authHeaders(), cache: "force-cache" },
	);
	if (res.status === 404) return undefined;
	if (!res.ok) throw new Error(`Customer story fetch failed: ${res.status}`);
	const data = (await res.json()) as { article: ApiArticleDetail };
	return {
		...enrichTechnologies(normalizeMeta(data.article.frontMatter)),
		html: parseMarkdownTextToHtml({
			markdown: data.article.markdown,
			options: { sanitize: true, lazyImages: true },
		}),
	};
}

// next slug in display (date-desc) order, wrapping to the first story
// (same semantics as the git-content era)
export async function getNextCustomerStorySlug(
	fetch: Fetch,
	slug: string,
): Promise<string | undefined> {
	const slugs = await getAllCustomerStorySlugs(fetch);
	if (slugs.length === 0) return undefined;
	const index = slugs.indexOf(slug);
	return slugs[(index + 1) % slugs.length];
}

// for human readable sitemap
export async function getCustomerStoriesSitemapSection(
	fetch: Fetch,
): Promise<SitemapSection> {
	const stories = await getAllCustomerStories(fetch);
	const pages: SitemapPage[] = stories.map((story) => {
		return {
			title: story.meta.title || "",
			description: story.meta?.description || "",
			date: "",
			href: `/customer-stories/${story.slug}` || "",
		};
	});
	const landing = {
		title: "Customer Stories",
		description:
			"Read how Lightning Jar helped customers improve their business.",
		date: "",
		href: "/customer-stories",
	};
	return {
		name: "Customer Stories",
		pages: [landing, ...pages],
	};
}
