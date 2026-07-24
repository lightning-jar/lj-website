// types

import { error } from "@sveltejs/kit";

import type { CustomerStory } from "$types/CustomerStory";

import {
	getCustomerStoryBySlug,
	getNextCustomerStorySlug,
} from "$content/getters/getCustomerStories";

// Rendered at request time so CMS saves go live without a redeploy —
// including brand-new slugs; Vercel's edge caches responses on the same
// TTLs as the CMS API.
export const prerender = false;

export async function load({ params, fetch, setHeaders }) {
	setHeaders({
		"cache-control": "public, s-maxage=300, stale-while-revalidate=3600",
	});

	const { slug } = params;

	const story: CustomerStory | undefined = await getCustomerStoryBySlug(
		fetch,
		slug,
	);

	if (!story) {
		return error(404, "Story not found");
	}

	const nextStorySlug = await getNextCustomerStorySlug(fetch, slug);

	return {
		...story,
		meta: {
			...(story.meta ?? {}),
			// thumbnail as social-card image (layout falls back to the
			// default card when absent or non-absolute)
			ogImage: story.thumbnailImage?.src
				? { url: story.thumbnailImage.src }
				: undefined,
		},
		nextStorySlug,
	};
}
