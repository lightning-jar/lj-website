import { error } from "@sveltejs/kit";

import { getReadingListArticleBySlug } from "$content/getters/getReadingList";

// Rendered at request time so CMS saves go live without a redeploy —
// including brand-new slugs; Vercel's edge caches responses on the same
// TTLs as the CMS API.
export const prerender = false;

export async function load({ params, fetch, setHeaders }) {
	setHeaders({
		"cache-control": "public, s-maxage=300, stale-while-revalidate=3600",
	});

	const article = await getReadingListArticleBySlug(fetch, params.slug);

	if (!article) {
		return error(404, "Entry not found");
	}

	return {
		article,
		meta: {
			title: article.metaTitle || article.title,
			description: article.description || article.excerpt || "",
		},
	};
}
