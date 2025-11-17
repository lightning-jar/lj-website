// data

import { error } from "@sveltejs/kit";

import { default as content } from "$data/customer-stories.json";

export function load({ params }) {
	const { slug } = params;

	const story = content.stories.find((story) => story.slug === slug);

	if (!story) {
		return error(404, "Story not found");
	}
	return {
		...story,
	};
}
