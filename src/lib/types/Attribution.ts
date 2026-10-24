import type { Image } from "#lib/types/Image.js";

export interface Attribution {
	name?: string;
	title?: string;
	organization?: string;
	image?: Image; // present in perspectives.attribution only
}
