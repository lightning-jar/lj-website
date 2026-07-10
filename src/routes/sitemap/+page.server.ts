import { blogArticlesSitemapSection } from "$content/getters/getBlogArticles";
import { builtWithSitemapSection } from "$content/getters/getBuiltWithContent";
import { customerStoriesSitemapSection } from "$content/getters/getCustomerStories";
import { homeSitemapSection } from "$content/getters/getHomeContent";
import { readingListSitemapSection } from "$content/getters/getReadingList";
import { servicesSitemapSection } from "$content/getters/getServicesContent";
import { technologiesSitemapSection } from "$content/getters/getTechnologiesContent";
import { termsSitemapSection } from "$content/getters/getTermsContent";
import { testimonialsSitemapSection } from "$content/getters/getTestimonialsContent";

const aboutSection = {
	name: "About",
	pages: [
		{
			href: "/about",
			title: "About Lightning Jar",
			description:
				"Who we are, what we believe, and twenty-five years of history: a design and build technology studio, independent since 2001.",
			date: "",
		},
	],
};

const archiveSection = {
	name: "Archive",
	pages: [
		{
			href: "/archive/introduction-to-pimcore",
			title: "",
			description:
				"Pimcore expert Jim Wagner and Lightning Jar CEO Kevin Peckham discuss the ins and outs of Pimcore -- the open source Product Information Management (PIM), Digital Asset Management (DAM,) Content Management (CMS), and eCommerce platform for enterprises.",
			date: "",
		},
	],
};

const sitemapSection = {
	name: "Sitemap & Website Config",
	pages: [
		{
			href: "/sitemap",
			title: "Sitemap",
			description: "",
			date: "",
		},
		{
			href: "/sitemap.xml",
			title: "Sitemap XML",
			description: "",
			date: "",
		},
		{
			href: "/robots.txt",
			title: "Robots.txt",
			description: "",
			date: "",
		},
	],
};

const sitemap = [
	homeSitemapSection,
	aboutSection,
	blogArticlesSitemapSection,
	builtWithSitemapSection,
	customerStoriesSitemapSection,
	servicesSitemapSection,
	technologiesSitemapSection,
	testimonialsSitemapSection,
	termsSitemapSection,
	archiveSection,
	readingListSitemapSection,
	sitemapSection,
];

export const load = async () => {
	return {
		sitemap: sitemap.sort((a, b) => a.name.localeCompare(b.name)),
		meta: {
			title: "Sitemap",
			shortTitle: "Sitemap Map",
			url: "/sitemap",
			description: "",
			keywords: [],
			robotsFollow: true,
			analyticsOn: true,
			frequency: "weekly",
			priority: 0.5,
		},
	};
};
