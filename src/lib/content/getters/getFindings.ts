// Findings-series entries live in the replicator CMS (Lightning Jar
// org, collection "findings", Findings blog entity) and are fetched at
// request time via the org-scoped public API. Unlike reading-list
// entries, findings carry a short markdown body (symptom, cause, fix,
// receipt), parsed locally by parseMarkdown on the detail fetch.
//
// Until the Findings blog entity is minted in replicator and
// FINDINGS_API_KEY is set, every getter degrades to empty — the
// listing renders its empty state and detail pages 404 — so the
// surface can ship ahead of the key. Flip FINDINGS_API_KEY to
// @required in .env.schema once the key exists everywhere.

// utils
import { parseMarkdownTextToHtml, stripLeadingH1 } from "$utils/parseMarkdown";

// types
import type { Finding, FindingDetail } from "$types/Finding";
import type { SitemapSection } from "$types/Sitemap";

// env
import { ENV } from "varlock/env";
import { cmsJson } from "./cmsJson";

type Fetch = typeof globalThis.fetch;

interface ApiFindingListItem {
	slug: string;
	title: string;
	frontMatter: Finding;
}

interface ApiFindingDetail extends ApiFindingListItem {
	markdown: string;
}

function apiBase(): string {
	const value = ENV.BLOG_CMS_BASE_URL;
	if (!value) throw new Error("BLOG_CMS_BASE_URL is not set");
	return value.replace(/\/$/, "");
}

// null (not throw) while the Findings entity is pre-mint — see header.
// Real per-blog keys start with "blogk_"; anything else is treated as
// a placeholder and ignored, so a stub value in an env file cannot turn
// the surface into a 503.
function apiKeyOrNull(): string | null {
	const key = ENV.FINDINGS_API_KEY;
	return key?.startsWith("blogk_") ? key : null;
}

// all entries, highest number first (verified date, then slug, as
// tiebreakers — number is the series' primary order)
export async function getAllFindings(fetch: Fetch): Promise<Finding[]> {
	const key = apiKeyOrNull();
	if (!key) return [];
	// No collection param: replicator's collection registry doesn't know
	// "findings" (yet) and the per-blog key already scopes requests to
	// the Findings blog entity.
	const data = await cmsJson<{ articles: ApiFindingListItem[] }>(
		fetch,
		`${apiBase()}/api/public/blog/articles?limit=500`,
		{ "x-api-key": key },
	);
	return data.articles
		.map((item) => item.frontMatter)
		.sort((a, b) => {
			const byNumber = (b.number ?? 0) - (a.number ?? 0);
			if (byNumber !== 0) return byNumber;
			const byVerified = (b.verified ?? "").localeCompare(a.verified ?? "");
			if (byVerified !== 0) return byVerified;
			return (a.slug ?? "").localeCompare(b.slug ?? "");
		});
}

export async function getFindingBySlug(
	fetch: Fetch,
	slug: string,
): Promise<FindingDetail | undefined> {
	const key = apiKeyOrNull();
	if (!key || !slug) return undefined;
	const data = await cmsJson<{ article: ApiFindingDetail } | null>(
		fetch,
		`${apiBase()}/api/public/blog/articles/${encodeURIComponent(slug)}`,
		{ "x-api-key": key },
		null,
	);
	if (!data) return undefined;
	return {
		frontMatter: data.article.frontMatter,
		html: parseMarkdownTextToHtml({
			// the template renders its own <h1> from frontmatter
			markdown: stripLeadingH1(data.article.markdown || ""),
			options: { sanitize: true, lazyImages: true },
		}),
	};
}

export async function getAllFindingsSlugs(fetch: Fetch): Promise<string[]> {
	const findings = await getAllFindings(fetch);
	return findings.map((f) => f.slug || "").filter(Boolean);
}

// for human readable sitemap
export async function getFindingsSitemapSection(
	fetch: Fetch,
): Promise<SitemapSection> {
	const findings = await getAllFindings(fetch);
	const pages = findings.map((f) => ({
		title: f.number ? `No. ${f.number}: ${f.title ?? ""}` : (f.title ?? ""),
		description: f.description || "",
		date: f.verified || "",
		href: f.slug ? `/findings/${f.slug}` : "",
	}));
	const landing = {
		title: "Findings",
		description:
			"Short, numbered field notes: one verified platform lesson per entry, with the receipt.",
		date: "",
		href: "/findings",
	};
	return { name: "Findings", pages: [landing, ...pages] };
}
