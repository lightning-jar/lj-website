// types
import type { Banner } from "$types/Banner";
import type { CustomerStorySummary } from "$types/CustomerStorySummary";
import type { PageMeta } from "$types/PageMeta";

// data
import { getAllCustomerStories } from "$content/getters/getCustomerStories";
import { default as landing } from "$content/landing-pages/customer-stories.json";

const banner: Banner = landing.banner;
const meta: PageMeta = landing.meta;
const clients: string[] = landing.clients ?? [];

// Rendered at request time so CMS saves go live without a redeploy;
// Vercel's edge caches responses on the same TTLs as the CMS API.
export const prerender = false;

export async function load({ fetch, setHeaders }) {
	setHeaders({
		"cache-control": "public, s-maxage=300, stale-while-revalidate=3600",
	});

	// reduce customer stories to summaries (getter is already order-sorted)
	const stories = await getAllCustomerStories(fetch);
	const customerStorySummaries: CustomerStorySummary[] = stories.map(
		(story) => ({
			banner: story.banner,
			customer: story.customer,
			thumbnailImage: story.thumbnailImage,
			excerpt: story.excerpt,
			tags: story.tags ?? [],
			slug: story.slug,
		}),
	);

	return {
		banner,
		meta,
		stories: customerStorySummaries,
		clients,
	};
}
