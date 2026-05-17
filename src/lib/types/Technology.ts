import type { Image } from "$types/Image";
import type { Link } from "$types/Link";

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
	supercategory?: string;
	useCases?: string[];
}
