import type { Image } from "#lib/types/Image.js";
import type { Link } from "#lib/types/Link.js";

export interface Technology {
	name: string;
	id: string;
	category: string;
	description: string[];
	shortDescription?: string;
	license?: string;
	logo?: Image;
	link?: Link;
	relatedArticle?: {
		href: string;
		title: string;
	};
	/** for Lightning Jar's own packages: path of the /packages page */
	packagePage?: string;
	supercategory?: string;
	useCases?: string[];
}
