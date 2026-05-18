import type { Banner } from "$types/Banner";
import type { ContentBlock } from "$types/ContentBlock";
import type { Customer } from "$types/Customer";
import type { Image } from "$types/Image";
import type { Link } from "$types/Link";
import type { PageMeta } from "$types/PageMeta";
import type { Testimonial } from "$types/Testimonial";

export interface CustomerStory {
	id?: string;
	banner: Banner;
	meta: PageMeta;
	customer: Customer;
	excerpt: string;
	title: string;
	slug: string;
	thumbnailImage: Image;
	content: ContentBlock[];
	testimonials: Testimonial[];
	images: Image[];
	perspectives: Testimonial[];
	technologies?: {
		id?: string;
		name?: string;
		logo?: Image;
		link?: Link;
	}[];
	featuredTechnologies?: string[];
	notice?: {
		label?: string;
		text: string;
		link: { href: string; text: string };
	};
	order: number;
	tags?: string[];
}
