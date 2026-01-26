import { error } from "@sveltejs/kit";

import type { FrontMatter } from "$types/FrontMatter";

// utils
import {
	allBlogArticleSlugs,
	allBlogArticles,
} from "$content/getters/getBlogArticles";

export async function load({ params }) {
	const slug = params.slug;

	const index = allBlogArticleSlugs.indexOf(slug);
	const article = allBlogArticles[index];

	const nextArticleSlug = allBlogArticleSlugs[index + 1];
	const previousArticleSlug = allBlogArticleSlugs[index - 1];

	if (!article) {
		return error(404, `Page not found`);
	}

	const { html, frontMatter } = article;
	const fm = frontMatter as FrontMatter;

	const meta = {
		title: fm?.metaTitle ?? "",
		description: fm?.description ?? "",
		author: fm?.author ?? "",
		date: fm?.date ?? "",
		tags: fm?.tags ?? [],
	};

	return {
		meta,
		title: fm?.title ?? "",
		additionalReading: fm?.additionalReading ?? [],
		quote: fm?.quote,
		glossary: fm?.glossary ?? [],
		image: fm?.image ?? "",
		html,
		nextArticleSlug,
		previousArticleSlug,
	};
}
