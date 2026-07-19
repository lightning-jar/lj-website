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

	// get all blog articles from the CMS at request time
	const rawArticles = await getAllBlogArticles(fetch);

	// reduce articles to front-matter only
	const articles: FrontMatter[] = rawArticles.map((article) => {
		return article.frontMatter || {};
	});

	const sortedArticles = articles.sort((a, b) => {
		const dateA = new Date(a.date || "");
		const dateB = new Date(b.date || "");
		return dateB.getTime() - dateA.getTime();
	});

	const meta = {
		title: "Blog",
		description: "Assorted updates and insights from the LJ team.",
	};

	return {
		articles: sortedArticles,
		meta,
	};
}
