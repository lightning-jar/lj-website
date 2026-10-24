import type { Image } from "#lib/types/Image.js";

export interface Customer {
	id: string;
	category: string;
	tags: string[];
	name: string;
	logo?: Image;
	thumb?: Image;
}
