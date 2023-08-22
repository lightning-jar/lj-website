// NAV
export interface NavItem {
	label: string;
	href?: string;
	rel?: string | null;
	title?: string;
	type?: string;
	menu?: NavItem[];
}
