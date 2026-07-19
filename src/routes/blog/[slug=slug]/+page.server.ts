import { error } from "@sveltejs/kit";

import type { FrontMatter } from "$types/FrontMatter";

// utils
import { getBlogArticleBySlug } from "$content/getters/getBlogArticles";

// Rendered at request time so CMS saves go live without a redeploy —
// including brand-new slugs; Vercel's edge caches responses on the same
// TTLs as the CMS API.
export const prerender = false;

export async function load({ params, fetch, setHeaders }) {
	setHeaders({
		"cache-control": "public, s-maxage=300, stale-while-revalidate=3600",
	});

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
