import type { Image } from "#lib/types/Image.js";
import type { SitemapXMLFrequency } from "#lib/types/Sitemap.js";

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
	frequency?: SitemapXMLFrequency | null; // for sitemap.xml
	priority?: number | string | null; // for sitemap.xml
}
