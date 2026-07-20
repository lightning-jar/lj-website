// src/routes/reading-list/atom.xml/+server.ts
//
// Reading-list-only Atom feed. Served at request time so CMS saves
// (including new entries) appear without a redeploy; runtime varlock
// resolution works since the 1Password plugin migration. Edge-cached
// on the CMS sitemap TTL.
// SvelteKit route option, read by the framework
// fallow-ignore-next-line unused-export
export const prerender = false;

import { ENV } from "varlock/env";
import type { RequestHandler } from "@sveltejs/kit";

import { getAllReadingListArticles } from "$content/getters/getReadingList";
import { buildAtomFeed } from "$utils/atomFeed";
import { buildReadingListEntries } from "$utils/feedEntries";

const baseUrl = `https://${
	ENV.VERCEL_PROJECT_PRODUCTION_URL || "www.lightningjar.com"
}`;

export const GET: RequestHandler = async ({ fetch }) => {
	const readingList = await getAllReadingListArticles(fetch);
	const atom = buildAtomFeed(buildReadingListEntries(baseUrl, readingList), {
		baseUrl,
		feedSelf: `${baseUrl}/reading-list/atom.xml`,
		feedTitle: "Lightning Jar — Reading List",
	});
	return new Response(atom, {
		headers: {
			"Content-Type": "application/atom+xml; charset=utf-8",
			"cache-control": "public, s-maxage=900, stale-while-revalidate=3600",
		},
	});
};
