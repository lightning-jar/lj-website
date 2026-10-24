import type { Image } from "#lib/types/Image.js";

export interface TechnologySupercategory {
	id: string;
	shortName?: string;
	name: string;
	description: string;
	icon?: Image;
}
