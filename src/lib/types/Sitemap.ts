export interface SitemapPage {
	href?: string | null;
	label?: string | null;
	date?: string | null;
}
export interface SitemapSection {
	name: string;
	pages: SitemapPage[];
}
export type Sitemap = SitemapSection[];

export interface SitemapXMLPage {
	path: string;
	changefreq: SitemapXMLFrequency;
	priority: number;
}

export type SitemapXMLFrequency = string;
