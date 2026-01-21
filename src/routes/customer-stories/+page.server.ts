// data
import { default as landing } from "$content/landing-pages/customer-stories.json";
import { allCustomerStories } from "$content/getters/getCustomerStories";

// types
import type { Banner } from "$types/Banner";
import type { PageMeta } from "$types/PageMeta";
import type { CustomerStory } from "$types/CustomerStory";

const banner: Banner = landing.banner;
const meta: PageMeta = landing.meta;

export function load(): {
	banner: Banner;
	meta: PageMeta;
	stories: CustomerStory[];
} {
	return {
		banner,
		meta,
		stories: allCustomerStories,
	};
}
