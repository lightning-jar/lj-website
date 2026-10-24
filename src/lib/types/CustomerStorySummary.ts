import type { Banner } from "#lib/types/Banner.js";
import type { Customer } from "#lib/types/Customer.js";
import type { Image } from "#lib/types/Image.js";

export interface CustomerStorySummary {
	banner: Banner;
	customer: Customer;
	thumbnailImage: Image;
	excerpt: string;
	tags: string[];
	slug: string;
}
