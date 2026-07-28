import { error } from "@sveltejs/kit";

import {
	allPackages,
	getPackageById,
	getRelatedPackages,
} from "$content/getters/getPackagesContent";

// git-resident content: prerender every package page
export const prerender = true;

export function entries() {
	return allPackages.map((pkg) => ({ slug: pkg.id }));
}

export function load({ params }) {
	const pkg = getPackageById(params.slug);
	if (!pkg) {
		return error(404, "Package not found");
	}

	return {
		pkg,
		related: getRelatedPackages(pkg).map((other) => ({
			id: other.id,
			name: other.name,
			tagline: other.tagline,
		})),
		meta: {
			title: `${pkg.name} | Packages & Tools`,
			description: pkg.tagline,
		},
	};
}
