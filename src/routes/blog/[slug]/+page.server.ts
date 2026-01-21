import { error } from "@sveltejs/kit";

// utils
import {
	allBlogArticleSlugs,
	allBlogArticles,
} from "$content/getters/getBlogArticles";

export async function load({ params }) {
	const slug = params.slug;

	const index = allBlogArticleSlugs.indexOf(slug);
	const article = allBlogArticles[index];

	if (!article) {
		return error(404, `Page not found`);
	}

	const { html, frontMatter } = article;

	const meta = {
		title: frontMatter?.metaTitle ?? "",
		description: frontMatter?.description ?? "",
		author: frontMatter.author,
		date: frontMatter.date,
		tags: frontMatter.tags,
	};

	return {
		meta,
		title: frontMatter?.title ?? "",
		html,
	};
}
