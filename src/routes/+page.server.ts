// data
import { homeContent } from "$content/getters/getHomeContent";
import { getAllBlogArticles } from "$content/getters/getBlogArticles";
import { getAllCustomerStories } from "$content/getters/getCustomerStories";

export async function load({ fetch }) {
	// latest customer stories for the homepage grid (curated order, capped
	// at 6; the getter is already order-sorted)
	const latestStories = (await getAllCustomerStories(fetch))
		.slice(0, 6)
		.map((story) => ({
			slug: story.slug ?? "",
			title: story.banner?.heading ?? "",
			image: story.thumbnailImage?.src ?? "",
		}));

	// latest blog articles for the homepage grid (newest first, capped at 6)
	const allArticles = await getAllBlogArticles(fetch);
	const latestArticles = allArticles.slice(0, 6).map((article) => ({
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

	// ticker withheld while hidden; restore by returning ...homeContent
	const { ticker, ...contentWithoutTicker } = homeContent;
	return {
		...contentWithoutTicker,
		latestArticles,
		latestStories,
	};
}
