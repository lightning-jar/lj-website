// types

import type { Article } from "$types/Article";
import type { Banner } from "$types/Banner";
import type { PageMeta } from "$types/PageMeta";

// data
import { getAllReadingListArticles } from "$content/getters/getReadingList";
import { default as landing } from "$content/landing-pages/reading-list.json";

const banner: Banner = landing.banner;
const meta: PageMeta = landing.meta;

// Rendered at request time so CMS saves go live without a redeploy;
// Vercel's edge caches responses on the same TTLs as the CMS API.
export const prerender = false;

export async function load({ fetch, setHeaders }): Promise<{
	banner: Banner;
	meta: PageMeta;
	articles: Article[];
}> {
	setHeaders({
		"cache-control": "public, s-maxage=300, stale-while-revalidate=3600",
	});

	return {
		articles: await getAllReadingListArticles(fetch),
		banner,
		meta,
	};
}
