import type { Image } from "$types/Image";

export interface TechnologySupercategory {
	id: string;
	shortName?: string;
	name: string;
	description: string;
	icon?: Image;
}
