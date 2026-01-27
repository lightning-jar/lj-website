import type { Banner } from "$types/Banner";
import type { Customer } from "$types/Customer";
import type { Image } from "$types/Image";

export interface CustomerStorySummary {
	banner: Banner;
	customer: Customer;
	thumbnailImage: Image;
	excerpt: string;
	tags: string[];
	slug: string;
}
