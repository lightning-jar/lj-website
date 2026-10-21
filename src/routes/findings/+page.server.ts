// types

import type { Banner } from "$types/Banner";
import type { Finding } from "$types/Finding";
import type { PageMeta } from "$types/PageMeta";

// data
import { getAllFindings } from "$content/getters/getFindings";
import { default as landing } from "$content/landing-pages/findings.json";

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
