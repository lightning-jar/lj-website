// data
import { homeContent } from "$content/getters/getHomeContent";
import { allBlogArticles } from "$content/getters/getBlogArticles";

// latest blog articles for the homepage grid (newest first, capped at 6)
const latestArticles = allBlogArticles.slice(0, 6).map((article) => ({
	slug:
		typeof article.frontMatter?.slug === "string"
			? article.frontMatter.slug
			: "",
	title:
		typeof article.frontMatter?.title === "string"
			? article.frontMatter.title
			: "",
	image:
		typeof article.frontMatter?.image === "string"
			? article.frontMatter.image
			: "",
}));

export function load() {
	// ticker withheld while hidden; restore by returning ...homeContent
	const { ticker, ...contentWithoutTicker } = homeContent;
	return {
		...contentWithoutTicker,
		latestArticles,
	};
}
