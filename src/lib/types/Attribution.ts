import type { Image } from "$types/Image";

export interface Attribution {
	name?: string;
	title?: string;
	organization?: string;
	image?: Image; // present in perspectives.attribution only
}
