import type { Link } from "#lib/types/Link.js";

export interface Banner {
	heading: string;
	subtitle?: string;
	subheading?: string;
	tag?: Link;
}
