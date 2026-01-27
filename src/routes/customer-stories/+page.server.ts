// types
import type { Banner } from "$types/Banner";
import type { CustomerStorySummary } from "$types/CustomerStorySummary";
import type { PageMeta } from "$types/PageMeta";

// data
import { allCustomerStories } from "$content/getters/getCustomerStories";
import { default as landing } from "$content/landing-pages/customer-stories.json";

const banner: Banner = landing.banner;
const meta: PageMeta = landing.meta;

// reduce customer stories to summaries
const customerStorySummaries: CustomerStorySummary[] = allCustomerStories
	.sort((a, b) => a.order - b.order)
	.map((story) => ({
		banner: story.banner,
		customer: story.customer,
		thumbnailImage: story.thumbnailImage,
		excerpt: story.excerpt,
		tags: story.tags ?? [],
		slug: story.slug,
	}));

export function load(): {
	banner: Banner;
	meta: PageMeta;
	stories: CustomerStorySummary[];
} {
	return {
		banner,
		meta,
		stories: customerStorySummaries,
	};
}
