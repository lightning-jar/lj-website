// types

import type { Banner } from "#lib/types/Banner.js";
import type { Finding } from "#lib/types/Finding.js";
import type { PageMeta } from "#lib/types/PageMeta.js";

// data
import { getAllFindings } from "#lib/content/getters/getFindings.js";
import { default as landing } from "#lib/content/landing-pages/findings.json";

const banner: Banner = landing.banner;
const meta: PageMeta = landing.meta;

// Rendered at request time so CMS saves go live without a redeploy;
// Vercel's edge caches responses on the same TTLs as the CMS API.
export const prerender = false;

export async function load({ fetch, setHeaders }): Promise<{
	banner: Banner;
	meta: PageMeta;
	findings: Finding[];
}> {
	setHeaders({
		"cache-control": "public, s-maxage=300, stale-while-revalidate=3600",
	});

	return {
		banner,
		findings: await getAllFindings(fetch),
		meta,
	};
}
