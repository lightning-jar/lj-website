import { error } from "@sveltejs/kit";

import {
	allTechnologies,
	getRelatedTechnologies,
	getTechnologyById,
	getTechnologySupercategory,
} from "$content/getters/getTechnologiesContent";

// git-resident content: prerender every technology page
export const prerender = true;

export function entries() {
	return allTechnologies.map((tech) => ({ slug: tech.id }));
}

export function load({ params }) {
	const technology = getTechnologyById(params.slug);
	if (!technology) {
		return error(404, "Technology not found");
	}

	return {
		technology,
		supercategory: getTechnologySupercategory(technology.supercategory),
		related: getRelatedTechnologies(technology).map((tech) => ({
			id: tech.id,
			name: tech.name,
			shortDescription: tech.shortDescription ?? "",
		})),
		meta: {
			title: technology.name,
			description: technology.shortDescription ?? "",
		},
	};
}
