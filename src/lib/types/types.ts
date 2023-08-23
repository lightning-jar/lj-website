// NAV
export interface NavItem {
	label: string;
	href?: string;
	rel?: string | null;
	title?: string;
	type?: string;
	menu?: NavItem[];
}

export interface Tile {
	[key: string]: string | undefined;
	iconSlug?: string;
	heading?: string;
	text?: string;
}
