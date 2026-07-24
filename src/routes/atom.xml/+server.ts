// src/routes/atom.xml/+server.ts
//
// Combined Atom feed: blog posts + customer stories + reading-list
// entries + barkup-bench studies. Served at
// request time so CMS saves (including new articles) appear without a
// redeploy; runtime varlock resolution works since the 1Password plugin
// migration. Edge-cached on the CMS sitemap TTL.
// SvelteKit route option, read by the framework
// fallow-ignore-next-line unused-export
export const prerender = false;

import { ENV } from "varlock/env";
import type { RequestHandler } from "@sveltejs/kit";

import { getAllBlogArticles } from "$content/getters/getBlogArticles";
import { getAllCustomerStories } from "$content/getters/getCustomerStories";
import { getAllReadingListArticles } from "$content/getters/getReadingList";
import { buildAtomFeed } from "$utils/atomFeed";
import {
	buildBlogEntries,
	buildCustomerStoryEntries,
	buildReadingListEntries,
	buildStudyEntries,
} from "$utils/feedEntries";

import benchStudies from "../research/barkup-bench/bench-studies.json";

const baseUrl = `https://${
	ENV.VERCEL_PROJECT_PRODUCTION_URL || "www.lightningjar.com"
}`;

export const GET: RequestHandler = async ({ fetch }) => {
	const [articles, stories, readingList] = await Promise.all([
		getAllBlogArticles(fetch),
		getAllCustomerStories(fetch),
		getAllReadingListArticles(fetch),
	]);
	const atom = buildAtomFeed(
		[
			...buildBlogEntries(baseUrl, articles),
			...buildCustomerStoryEntries(baseUrl, stories),
			...buildReadingListEntries(baseUrl, readingList),
			...buildStudyEntries(baseUrl, benchStudies.studies),
		],
		{
			baseUrl,
			feedSelf: `${baseUrl}/atom.xml`,
			feedTitle: "Lightning Jar — Everything",
		},
	);
	return new Response(atom, {
		headers: {
			"Content-Type": "application/atom+xml; charset=utf-8",
			"cache-control": "public, s-maxage=900, stale-while-revalidate=3600",
		},
	});
};
