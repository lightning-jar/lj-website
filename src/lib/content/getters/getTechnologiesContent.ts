// import landing page content
import page from "$content/landing-pages/technologies.json";

// types
import type { Technology } from "$types/Technology";
import type { TechnologySupercategory } from "$types/TechnologySupercategory";

// function to load all technology
async function loadAllTechnologiesJson() {
	const modules: Record<string, { default: Technology }> = import.meta.glob(
		"/src/lib/content/technologies/**/*.json",
		{
			eager: true, // import immediately (synchronous result)
		},
	);

	// modules is an object: { '/src/content/a.txt': '...', '/src/content/sub/b.txt': '...' }
	return Object.entries(modules).map(
		([_path, contents]) => contents?.default || "",
	);
}

// function to load all technology super categories
async function loadAllTechnologySupercategoriesJson() {
	const modules: Record<string, { default: TechnologySupercategory }> =
		import.meta.glob("/src/lib/content/technologySuperCategories/**/*.json", {
			eager: true, // import immediately (synchronous result)
		});

	// modules is an object: { '/src/content/a.txt': '...', '/src/content/sub/b.txt': '...' }
	return Object.entries(modules).map(
		([_path, contents]) => contents?.default || "",
	);
}

// export landing page content
export const technologiesLandingPageContent = page;

// export sitemap section
export const technologiesSitemapSection = {
	name: "Technologies",
	pages: [
		{
			href: "/technologies",
			description: page.meta.description,
			title: page.meta.title,
			date: "",
		},
	],
};

// export all technologies
export const allTechnologies: Technology[] = await loadAllTechnologiesJson();

// export all technology super categories
export const allTechnologySupercategories: TechnologySupercategory[] =
	await loadAllTechnologySupercategoriesJson();
