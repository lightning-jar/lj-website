// Research atom feed: one entry per barkup-bench study, newest first.
// Unlike the blog feed (request-time, CMS-backed), study results ship
// with the site itself, so this feed is PRERENDERED — it updates on
// exactly the deploys that publish new studies, and the CDN cache
// busts with each deploy.
// SvelteKit route option, read by the framework
// fallow-ignore-next-line unused-export
export const prerender = true;

import { buildAtomFeed } from "$utils/atomFeed";
import { buildStudyEntries } from "$utils/feedEntries";

import type { RequestHandler } from "@sveltejs/kit";

import benchStudies from "../bench-studies.json";

const baseUrl = "https://www.lightningjar.com";

export const GET: RequestHandler = () => {
	const entries = buildStudyEntries(baseUrl, benchStudies.studies);
	const atom = buildAtomFeed(entries, {
		baseUrl,
		feedSelf: `${baseUrl}/research/barkup-bench/atom.xml`,
		feedTitle: "Lightning Jar — Barkup Bench research",
	});
	return new Response(atom, {
		headers: { "Content-Type": "application/atom+xml; charset=utf-8" },
	});
};
