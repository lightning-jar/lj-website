// utils
import { allBlogArticles } from "./getArticles";

// types
type FrontMatter = Record<string, string>;

// get all blog articles
const rawArticles = await allBlogArticles;

// reduce articles to front-matter only
const articles: FrontMatter[] = rawArticles.map((article) => {
	return article.frontMatter || {};
});

export function load() {
	const meta = {
		title: "Blog",
		description: "Assorted updates and insights from the LJ team.",
	};

	return {
		meta,
		articles,
	};
}
