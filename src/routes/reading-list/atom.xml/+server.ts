// src/routes/reading-list/atom.xml/+server.ts
//
// Reading-list-only Atom feed. Prerendered (varlock/env constraint).
export const prerender = true;

import { ENV } from "varlock/env";
import type { RequestHandler } from "@sveltejs/kit";

import { buildAtomFeed } from "$utils/atomFeed";
import { buildReadingListEntries } from "$utils/feedEntries";

const baseUrl = `https://${
	ENV.VERCEL_PROJECT_PRODUCTION_URL || "www.lightningjar.com"
}`;

const atom = buildAtomFeed(buildReadingListEntries(baseUrl), {
	baseUrl,
	feedSelf: `${baseUrl}/reading-list/atom.xml`,
	feedTitle: "Lightning Jar — Reading List",
});

export const GET: RequestHandler = async () =>
	new Response(atom, {
		headers: { "Content-Type": "application/atom+xml; charset=utf-8" },
	});
