// types

import type { Article } from "#lib/types/Article.js";
import type { Banner } from "#lib/types/Banner.js";
import type { PageMeta } from "#lib/types/PageMeta.js";

// data
import { getAllReadingListArticles } from "#lib/content/getters/getReadingList.js";
import { default as landing } from "#lib/content/landing-pages/reading-list.json";

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
