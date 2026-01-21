export interface SitemapPage {
	href?: string;
	title?: string;
	description?: string;
	date?: string;
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
