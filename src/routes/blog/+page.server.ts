// types
import type { FrontMatter } from "$types/FrontMatter";

import { getAllBlogArticles } from "$content/getters/getBlogArticles";

// Rendered at request time so CMS saves go live without a redeploy;
// Vercel's edge caches responses on the same TTLs as the CMS API.
export const prerender = false;

export async function load({ fetch, setHeaders }) {
	setHeaders({
		"cache-control": "public, s-maxage=300, stale-while-revalidate=3600",
	});

	// get all blog articles from the CMS at request time. The getter
	// already returns them newest-first (by editorial date, then by
	// full publish timestamp for same-day ties), so we keep that order
	// rather than re-sorting on the day-only date here.
	const rawArticles = await getAllBlogArticles(fetch);

	// reduce articles to front-matter only, preserving the getter's order
	const articles: FrontMatter[] = rawArticles.map(
		(article) => article.frontMatter || {},
	);

	const meta = {
		title: "Blog",
		description: "Assorted updates and insights from the LJ team.",
	};

	return {
		articles,
		meta,
	};
}
