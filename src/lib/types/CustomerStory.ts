import type { Banner } from "#lib/types/Banner.js";
import type { Customer } from "#lib/types/Customer.js";
import type { Image } from "#lib/types/Image.js";
import type { Link } from "#lib/types/Link.js";
import type { PageMeta } from "#lib/types/PageMeta.js";
import type { Testimonial } from "#lib/types/Testimonial.js";

export interface CustomerStory {
	id?: string;
	banner: Banner;
	meta: PageMeta;
	customer: Customer;
	excerpt: string;
	title: string;
	slug: string;
	thumbnailImage: Image;
	/** Rendered article body (markdown from the CMS, parsed locally).
	 *  Present on detail fetches only — list entries omit the body. */
	html?: string;
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
	date?: string;
	tags?: string[];
}
