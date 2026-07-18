import { error } from "@sveltejs/kit";

import type { FrontMatter } from "$types/FrontMatter";

// utils
import { getBlogArticleBySlug } from "$content/getters/getBlogArticles";

export async function load({ params, fetch }) {
	const slug = params.slug;

	const article = await getBlogArticleBySlug(fetch, slug);

	if (!article) {
		return error(404, `Page not found`);
	}

	const { html, frontMatter, nextArticleSlug, previousArticleSlug } = article;
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
		sources: fm?.sources ?? [],
		nextArticleSlug,
		previousArticleSlug,
	};
}
