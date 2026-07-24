// src/routes/customer-stories/atom.xml/+server.ts
//
// Customer-stories-only Atom feed. Served at request time so CMS saves
// (including new stories) appear without a redeploy. Edge-cached on the
// CMS sitemap TTL.
// SvelteKit route option, read by the framework
// fallow-ignore-next-line unused-export
export const prerender = false;

import { ENV } from "varlock/env";
import type { RequestHandler } from "@sveltejs/kit";

import { getAllCustomerStories } from "$content/getters/getCustomerStories";
import { buildAtomFeed } from "$utils/atomFeed";
import { buildCustomerStoryEntries } from "$utils/feedEntries";

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
