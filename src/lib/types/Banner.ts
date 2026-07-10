import type { Link } from "$types/Link";

export interface Banner {
	heading: string;
	subtitle?: string;
	subheading?: string;
	tag?: Link;
}
