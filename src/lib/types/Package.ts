import type { Link } from "$types/Link";

/** An open-source package or tool made by Lightning Jar, featured on
 * the /packages ("Packages & Tools") section. Distinct from Technology:
 * a technology entry answers "why is this in our stack", a package page
 * is the product view for something we ship. */
export interface LjPackage {
	id: string;
	name: string;
	/** npm package name, when the item is an npm package */
	npmName?: string;
	/** short label shown next to the name, e.g. "Beta" or "Live" */
	status: string;
	license?: string;
	category: string;
	/** one-sentence summary for cards, search, and meta descriptions */
	tagline: string;
	description: string[];
	/** install command shown on the detail page */
	install?: string;
	/** primary link first; rendered as buttons in order */
	links: { label: string; href: string }[];
	features?: string[];
	relatedArticles?: { title: string; href: string }[];
	/** id of the matching technology entry, for the stack cross-link */
	techId?: string;
	logo?: { src: string; alt?: string };
	link?: Link;
}
