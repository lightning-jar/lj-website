import type { Image } from "$types/Image";

export interface Customer {
	id: string;
	category: string;
	tags: string[];
	name: string;
	logo?: Image;
	thumb?: Image;
}
