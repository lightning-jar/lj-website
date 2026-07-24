import { getBlogArticlesSitemapSection } from "$content/getters/getBlogArticles";
import { builtWithSitemapSection } from "$content/getters/getBuiltWithContent";
import { getCustomerStoriesSitemapSection } from "$content/getters/getCustomerStories";
import { homeSitemapSection } from "$content/getters/getHomeContent";
import { getReadingListSitemapSection } from "$content/getters/getReadingList";
import { servicesSitemapSection } from "$content/getters/getServicesContent";
import { technologiesSitemapSection } from "$content/getters/getTechnologiesContent";
import { termsSitemapSection } from "$content/getters/getTermsContent";
import { testimonialsSitemapSection } from "$content/getters/getTestimonialsContent";

import benchStudies from "./../research/barkup-bench/bench-studies.json";

const aboutSection = {
	name: "About",
	pages: [
		{
			href: "/about",
			title: "About Lightning Jar",
			description:
				"Who we are, what we believe, and twenty-five years of history: a design, build, and brand technology studio, independent since 2001.",
			date: "",
		},
	],
};

const funSection = {
	name: "Fun",
	pages: [
		{
			href: "/fun",
			title: "Fun",
			description:
				"Side projects from the studio: open-source experiments, instruments, and toys we built because the itch was there.",
			date: "",
		},
	],
};

const researchSection = {
	name: "Research",
	pages: [
		{
			href: "/research",
			title: "Research",
			description:
				"Lightning Jar's open research program: pre-registered studies delivering practical guidance for developers of LLM applications.",
			date: "",
		},
		{
			href: "/research/barkup-bench",
			title: "Barkup Bench",
			description:
				"Our open, pre-registered benchmark series measuring how LLMs read and edit structured document trees: results dashboard, packages, and the full article series.",
			date: "",
		},
		...benchStudies.studies.map((s) => ({
			href: `/research/barkup-bench/${s.slug}`,
			title: `Study ${s.letters}: ${s.title}`,
			description: s.indexLine,
			date: s.published,
		})),
		{
			href: "/research/barkup-bench/playbook",
			title: "The Builder's Playbook",
			description:
				"The practical distillation of the benchmark series: ten measured guidelines for building document-editing apps with LLM agents, each with a scenario, a code example, and a link to its chart.",
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
		{
			href: "/feeds",
			title: "Feeds",
			description:
				"All five Atom feeds, described: everything combined, blog, customer stories, research, and reading list.",
			date: "",
		},
	],
};

// Request-time so newly published CMS articles are listed without a
// redeploy; edge-cached on the CMS sitemap TTL.
export const prerender = false;

export const load = async ({ fetch, setHeaders }) => {
	setHeaders({
		"cache-control": "public, s-maxage=900, stale-while-revalidate=3600",
	});
	const sitemap = [
		homeSitemapSection,
		aboutSection,
		funSection,
		researchSection,
		await getBlogArticlesSitemapSection(fetch),
		builtWithSitemapSection,
		await getCustomerStoriesSitemapSection(fetch),
		servicesSitemapSection,
		technologiesSitemapSection,
		testimonialsSitemapSection,
		termsSitemapSection,
		archiveSection,
		await getReadingListSitemapSection(fetch),
		sitemapSection,
	];

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
