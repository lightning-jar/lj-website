// src/routes/atom.xml/+server.ts
//
// Atom feed merging blog posts and reading-list entries. Prerendered so it
// resolves `varlock/env` at build time (same constraint as /sitemap.xml).
export const prerender = true;

import { ENV } from "varlock/env";
import type { RequestHandler } from "@sveltejs/kit";

import { allBlogArticles } from "$content/getters/getBlogArticles";
import { allReadingListArticles } from "$content/getters/getReadingList";

const productionUrl =
	ENV.VERCEL_PROJECT_PRODUCTION_URL || "www.lightningjar.com";
const baseUrl = `https://${productionUrl}`;
const FEED_TITLE = "Lightning Jar — Blog & Reading List";
const FEED_SELF = `${baseUrl}/atom.xml`;

function escapeXML(s: string): string {
	return s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

function toIso(date: string | undefined): string {
	if (!date) return new Date().toISOString();
	// Stored dates are YYYY-MM-DD; pin to noon UTC for stable, unambiguous output.
	const d = new Date(date.length === 10 ? `${date}T12:00:00Z` : date);
	return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function str(value: unknown): string {
	return typeof value === "string" ? value : "";
}

type FeedEntry = {
	id: string;
	title: string;
	link: string;
	updated: string;
	summary: string;
	authorName: string;
	category: "Blog" | "Reading List";
};

const blogEntries: FeedEntry[] = allBlogArticles.flatMap((a) => {
	const fm = a.frontMatter ?? {};
	const slug = str(fm.slug);
	if (!slug) return [];
	const url = `${baseUrl}/blog/${slug}`;
	return [
		{
			id: url,
			title: str(fm.metaTitle) || str(fm.title),
			link: url,
			updated: toIso(str(fm.date)),
			summary: str(fm.description),
			authorName: str(fm.author) || "Lightning Jar",
			category: "Blog" as const,
		},
	];
});

const readingEntries: FeedEntry[] = allReadingListArticles.flatMap((a) => {
	if (!a?.slug) return [];
	return [
		{
			id: `tag:lightningjar.com,2026:reading-list:${a.slug}`,
			link: a.url || `${baseUrl}/reading-list`,
			title: a.title || "",
			updated: toIso(a.repostDate || a.publishDate),
			summary: a.summary || a.excerpt || "",
			authorName: a.author?.name || a.source?.publicationName || "Lightning Jar",
			category: "Reading List" as const,
		},
	];
});

const entries: FeedEntry[] = [...blogEntries, ...readingEntries].sort((a, b) =>
	b.updated.localeCompare(a.updated),
);

const feedUpdated = entries[0]?.updated ?? new Date().toISOString();

function renderEntry(e: FeedEntry): string {
	return `  <entry>
    <id>${escapeXML(e.id)}</id>
    <title>${escapeXML(e.title)}</title>
    <link rel="alternate" type="text/html" href="${escapeXML(e.link)}"/>
    <updated>${e.updated}</updated>
    <author><name>${escapeXML(e.authorName)}</name></author>
    <category term="${escapeXML(e.category)}"/>
    <summary type="text">${escapeXML(e.summary)}</summary>
  </entry>`;
}

const atom = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>${FEED_SELF}</id>
  <title>${escapeXML(FEED_TITLE)}</title>
  <link rel="self" type="application/atom+xml" href="${FEED_SELF}"/>
  <link rel="alternate" type="text/html" href="${baseUrl}/"/>
  <updated>${feedUpdated}</updated>
  <author><name>Lightning Jar</name></author>
${entries.map(renderEntry).join("\n")}
</feed>`;

export const GET: RequestHandler = async () =>
	new Response(atom, {
		headers: { "Content-Type": "application/atom+xml; charset=utf-8" },
	});
