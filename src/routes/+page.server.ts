// data
import { homeContent } from "$content/getters/getHomeContent";
import { allBlogArticles } from "$content/getters/getBlogArticles";
import { allCustomerStories } from "$content/getters/getCustomerStories";

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

// latest customer stories for the homepage grid (curated order, capped at 6)
const latestStories = [...allCustomerStories]
	.sort((a, b) => a.order - b.order)
	.slice(0, 6)
	.map((story) => ({
		slug: story.slug ?? "",
		title: story.banner?.heading ?? "",
		image: story.thumbnailImage?.src ?? "",
	}));

export function load() {
	// ticker withheld while hidden; restore by returning ...homeContent
	const { ticker, ...contentWithoutTicker } = homeContent;
	return {
		...contentWithoutTicker,
		latestArticles,
		latestStories,
	};
}
