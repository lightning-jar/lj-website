// import { default as content } from "$content/customer-stories.json";
//
// types
import type { CustomerStory } from "$types/CustomerStory";
import type { SitemapPage, SitemapSection } from "$types/Sitemap";

import { allTechnologies } from "$content/getters/getTechnologiesContent";

async function loadAllCustomerStoriesJson() {
	const modules: Record<string, { default: CustomerStory }> = import.meta.glob(
		"/src/lib/content/customer-stories/**/*.json",
		{
			eager: true, // import immediately (synchronous result)
		},
	);

	// modules is an object: { '/src/content/a.txt': '...', '/src/content/sub/b.txt': '...' }
	return Object.entries(modules).map(
		([_path, contents]) => contents?.default || "",
	);
}

export async function getAllCustomerStories(): Promise<CustomerStory[]> {
	const stories = await loadAllCustomerStoriesJson();

	return stories.map((story) => {
		const ids = story.featuredTechnologies;
		if (!Array.isArray(ids) || ids.length === 0) {
			return { ...story, technologies: [] };
		}

		const technologies = ids.map((id) => {
			const tech = allTechnologies.find((t) => t.id === id);
			if (!tech) {
				console.warn(`Technology with id ${id} not found`);
			}
			return {
				id: tech?.id ?? "",
				name: tech?.name ?? "",
				logo: tech?.logo,
				link: tech?.link,
			};
		});

		return { ...story, technologies };
	});
}

export const allCustomerStories: CustomerStory[] =
	await getAllCustomerStories();
export const allCustomerStorySlugs: string[] = allCustomerStories
	.map((story) => story?.slug || "")
	.filter(Boolean);

export function getCustomerStoryBySlug(
	slug: string,
): CustomerStory | undefined {
	return allCustomerStories.find((story) => story.slug === slug);
}

export const allCustomerStoriesSitemapMeta = allCustomerStories.map((story) => {
	return {
		title: story.meta.title || "",
		description: story.meta.description || "",
		slug: story.meta.slug || "",
	};
});

// for human readable sitemap
function buildHumanSitemapSection() {
	const pages: SitemapPage[] = allCustomerStories.map((story) => {
		return {
			title: story.meta.title || "",
			description: story.meta?.description || "",
			date: "",
			href: `/customer-stories/${story.slug}` || "",
		};
	});
	const landing = {
		title: "Customer Stories",
		description:
			"Read how Lightning Jar helped customers improve their business.",
		date: "",
		href: "/customer-stories",
	};
	const section: SitemapSection = {
		name: "Customer Stories",
		pages: [landing, ...pages],
	};
	return section;
}

export const customerStoriesSitemapSection = buildHumanSitemapSection();
