// types
import type { CustomerStory } from "$types/CustomerStory";

import { error } from "@sveltejs/kit";

import { getCustomerStoryBySlug } from "$content/getters/getCustomerStories";

export function load({ params }) {
	const { slug } = params;

	const story: CustomerStory | undefined = getCustomerStoryBySlug(slug);

	if (!story) {
		return error(404, "Story not found");
	}
	return {
		...story,
	};
}
