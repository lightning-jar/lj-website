// src/routes/customer-stories/atom.xml/+server.ts
//
// Customer-stories-only Atom feed. Served at request time so CMS saves
// (including new stories) appear without a redeploy. Edge-cached on the
// CMS sitemap TTL.
// SvelteKit route option, read by the framework
// fallow-ignore-next-line unused-export
export const prerender = false;

import { buildAtomFeed } from "#lib/utils/atomFeed.js";
import { buildCustomerStoryEntries } from "#lib/utils/feedEntries.js";

import type { RequestHandler } from "@sveltejs/kit";

import { getAllCustomerStories } from "#lib/content/getters/getCustomerStories.js";

import { ENV } from "varlock/env";

const baseUrl = `https://${
	ENV.VERCEL_PROJECT_PRODUCTION_URL || "www.lightningjar.com"
}`;

export const GET: RequestHandler = async ({ fetch }) => {
	const stories = await getAllCustomerStories(fetch);
	const atom = buildAtomFeed(buildCustomerStoryEntries(baseUrl, stories), {
		baseUrl,
		feedSelf: `${baseUrl}/customer-stories/atom.xml`,
		feedTitle: "Lightning Jar — Customer Stories",
	});
	return new Response(atom, {
		headers: {
			"Content-Type": "application/atom+xml; charset=utf-8",
			"cache-control": "public, s-maxage=900, stale-while-revalidate=3600",
		},
	});
};
