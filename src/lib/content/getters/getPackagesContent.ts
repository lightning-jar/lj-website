// types
import type { LjPackage } from "$types/Package";

// function to load all package JSONs
async function loadAllPackagesJson() {
	const modules: Record<string, { default: LjPackage }> = import.meta.glob(
		"/src/lib/content/packages/**/*.json",
		{
			eager: true, // import immediately (synchronous result)
		},
	);

	return Object.entries(modules).map(
		([_path, contents]) => contents?.default || "",
	);
}

// landing-page meta, shared by the route and the sitemap section
export const packagesLandingMeta = {
	title: "Packages & Tools | Lightning Jar",
	description:
		"Open-source packages and tools from the Lightning Jar studio: barkup, barkdown, woof-editor, and more to come. Built for production, published for everyone.",
};

// export all packages (alphabetical by name)
export const allPackages: LjPackage[] = (await loadAllPackagesJson()).sort(
	(a, b) => a.name.localeCompare(b.name),
);

// detail-page lookup
export function getPackageById(id: string): LjPackage | undefined {
	return allPackages.find((pkg) => pkg.id === id);
}

// sibling packages, for the detail page's related list
export function getRelatedPackages(pkg: LjPackage): LjPackage[] {
	return allPackages.filter((other) => other.id !== pkg.id);
}

// export sitemap section (landing + one page per package)
export const packagesSitemapSection = {
	name: "Packages & Tools",
	pages: [
		{
			href: "/packages",
			description: packagesLandingMeta.description,
			title: "Packages & Tools",
			date: "",
		},
		...allPackages.map((pkg) => ({
			href: `/packages/${pkg.id}`,
			description: pkg.tagline,
			title: pkg.name,
			date: "",
		})),
	],
};
