// utils
import { allBlogArticles } from "$content/getters/getBlogArticles";

// types
type FrontMatter = Record<string, string>;

// get all blog articles
const rawArticles = await allBlogArticles;

// reduce articles to front-matter only
const articles: FrontMatter[] = rawArticles.map((article) => {
	return article.frontMatter || {};
});

const sortedArticles = articles.sort((a, b) => {
	const dateA = new Date(a.date);
	const dateB = new Date(b.date);
	return dateB.getTime() - dateA.getTime();
});

export function load() {
	const meta = {
		title: "Blog",
		description: "Assorted updates and insights from the LJ team.",
	};

	return {
		articles: sortedArticles,
		meta,
	};
}
