import type { Image } from "$types/Image";
import type { SitemapXMLFrequency } from "$types/Sitemap";

export interface PageMeta {
	[key: string]: unknown;
	title?: string | null;
	shortTitle?: string | null;
	description?: string | null;
	keywords?: string[] | null;
	ogImage?: Image | null;
	url?: string | null;
	robotsFollow?: boolean | null;
	analyticsOn?: boolean | null;
	frequency?: SitemapXMLFrequency | null; 	// for sitemap.xml
	priority?: number | string | null; // for sitemap.xml
}
