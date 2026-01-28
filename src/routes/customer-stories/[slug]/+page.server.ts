// types

import { error } from "@sveltejs/kit";

import type { CustomerStory } from "$types/CustomerStory";

import {
	getCustomerStoryBySlug,
	getNextCustomerStorySlug,
} from "$content/getters/getCustomerStories";

export function load({ params }) {
	const { slug } = params;

	const story: CustomerStory | undefined = getCustomerStoryBySlug(slug);
	const nextStorySlug = getNextCustomerStorySlug(slug);

	if (!story) {
		return error(404, "Story not found");
	}
	return {
		...story,
		nextStorySlug,
	};
}
