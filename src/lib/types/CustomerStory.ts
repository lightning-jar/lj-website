import type { Banner } from "$types/Banner";
import type { ContentBlock } from "$types/ContentBlock";
import type { Customer } from "$types/Customer";
import type { Image } from "$types/Image";
import type { PageMeta } from "$types/PageMeta";
import type { Technology } from "$types/Technology";
import type { Testimonial } from "$types/Testimonial";

export interface CustomerStory {
	banner: Banner;
	meta: PageMeta;
	customer: Customer;
	excerpt: string;
	title: string;
	slug: string;
	image: string;
	content: ContentBlock[];
	testimonials: Testimonial[];
	images: Image[];
	perspectives: Testimonial[];
	technologies: Technology[];
	order?: number;
}
