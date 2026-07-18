// src/routes/atom.xml/+server.ts
//
// Combined Atom feed: blog posts + reading-list entries. Prerendered so it
// resolves `varlock/env` at build time (same constraint as /sitemap.xml).
// SvelteKit route option, read by the framework
// fallow-ignore-next-line unused-export
export const prerender = true;

import { ENV } from "varlock/env";
import type { RequestHandler } from "@sveltejs/kit";

import { getAllBlogArticles } from "$content/getters/getBlogArticles";
import { buildAtomFeed } from "$utils/atomFeed";
import { buildBlogEntries, buildReadingListEntries } from "$utils/feedEntries";

const baseUrl = `https://${
	ENV.VERCEL_PROJECT_PRODUCTION_URL || "www.lightningjar.com"
}`;

export const GET: RequestHandler = async ({ fetch }) => {
	const articles = await getAllBlogArticles(fetch);
	const atom = buildAtomFeed(
		[
			...buildBlogEntries(baseUrl, articles),
			...buildReadingListEntries(baseUrl),
		],
		{
			baseUrl,
			feedSelf: `${baseUrl}/atom.xml`,
			feedTitle: "Lightning Jar — Blog & Reading List",
		},
	);
	return new Response(atom, {
		headers: { "Content-Type": "application/atom+xml; charset=utf-8" },
	});
};
