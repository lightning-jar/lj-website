import {
	allPackages,
	packagesLandingMeta,
} from "$content/getters/getPackagesContent";

// git-resident content: prerender
export const prerender = true;

export function load() {
	return {
		packages: allPackages.map((pkg) => ({
			id: pkg.id,
			name: pkg.name,
			status: pkg.status,
			tagline: pkg.tagline,
			links: pkg.links,
		})),
		meta: {
			...packagesLandingMeta,
			robotsFollow: true,
			analyticsOn: true,
		},
	};
}
