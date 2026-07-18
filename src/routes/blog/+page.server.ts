// types
import type { FrontMatter } from "$types/FrontMatter";

import { getAllBlogArticles } from "$content/getters/getBlogArticles";

export async function load({ fetch }) {
	// get all blog articles from the CMS (prerendered → build-time fetch)
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
