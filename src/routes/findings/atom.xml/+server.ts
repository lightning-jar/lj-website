// src/routes/findings/atom.xml/+server.ts
//
// Findings-only Atom feed. Served at request time so CMS saves
// (including new entries) appear without a redeploy. Edge-cached on
// the CMS sitemap TTL.
// SvelteKit route option, read by the framework
// fallow-ignore-next-line unused-export
export const prerender = false;

import { buildAtomFeed } from "$utils/atomFeed";
import { buildFindingsEntries } from "$utils/feedEntries";

import type { RequestHandler } from "@sveltejs/kit";

import { getAllFindings } from "$content/getters/getFindings";

import { ENV } from "varlock/env";

const baseUrl = `https://${
	ENV.VERCEL_PROJECT_PRODUCTION_URL || "www.lightningjar.com"
}`;

export const GET: RequestHandler = async ({ fetch }) => {
	const findings = await getAllFindings(fetch);
	const atom = buildAtomFeed(buildFindingsEntries(baseUrl, findings), {
		baseUrl,
		feedSelf: `${baseUrl}/findings/atom.xml`,
		feedTitle: "Lightning Jar — Findings",
	});
	return new Response(atom, {
		headers: {
			"Content-Type": "application/atom+xml; charset=utf-8",
			"cache-control": "public, s-maxage=900, stale-while-revalidate=3600",
		},
	});
};
