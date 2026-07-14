// src/routes/blog/atom.xml/+server.ts
//
// Blog-only Atom feed. Prerendered (varlock/env constraint).
// SvelteKit route option, read by the framework
// fallow-ignore-next-line unused-export
export const prerender = true;

import { ENV } from "varlock/env";
import type { RequestHandler } from "@sveltejs/kit";

import { buildAtomFeed } from "$utils/atomFeed";
import { buildBlogEntries } from "$utils/feedEntries";

const baseUrl = `https://${
	ENV.VERCEL_PROJECT_PRODUCTION_URL || "www.lightningjar.com"
}`;

const atom = buildAtomFeed(buildBlogEntries(baseUrl), {
	baseUrl,
	feedSelf: `${baseUrl}/blog/atom.xml`,
	feedTitle: "Lightning Jar — Blog",
});

export const GET: RequestHandler = async () =>
	new Response(atom, {
		headers: { "Content-Type": "application/atom+xml; charset=utf-8" },
	});
