import { json } from "@sveltejs/kit";

import type { SearchRecord } from "$utils/siteSearch";
import type { RequestHandler } from "./$types";

import { getAllBlogArticles } from "$content/getters/getBlogArticles";
import { getAllCustomerStories } from "$content/getters/getCustomerStories";
import { allPackages } from "$content/getters/getPackagesContent";
import { getAllReadingListArticles } from "$content/getters/getReadingList";
import { allTechnologies } from "$content/getters/getTechnologiesContent";

import aeoStudies from "../research/aeo-bench/aeo-studies.json";
import benchStudies from "../research/barkup-bench/bench-studies.json";

// Lightweight index for the nav search box: one small JSON fetch, then
// all filtering happens client-side (siteSearch.ts). Request-time so it
// always reflects published CMS content; edge-cached like the sitemap.
export const prerender = false;

const blurb = (text: string | undefined | null) => (text ?? "").slice(0, 200);

export const GET: RequestHandler = async ({ fetch }) => {
	const [articles, stories, readingList] = await Promise.all([
		getAllBlogArticles(fetch),
		getAllCustomerStories(fetch),
		getAllReadingListArticles(fetch),
	]);

	const records: SearchRecord[] = [
		// standalone pages worth surfacing in search (no getter feeds these)
		{
			type: "page",
			title: "Ask Eljay",
			blurb:
				"Our AI assistant: a chat guide to the studio's work, research, packages, and writing, grounded in this site's own content.",
			tags: ["AI", "Chat", "Assistant", "Agent", "Eljay"],
			url: "/ask-eljay",
		},
		{
			type: "page",
			title: "About Lightning Jar",
			blurb:
				"Who we are, what we believe, and twenty-five years of history: a design, build, and brand technology studio, independent since 2001.",
			tags: ["Studio", "History", "Team"],
			url: "/about",
		},
		{
			type: "page",
			title: "Services",
			blurb:
				"Web application design and development, custom software, AI and LLM solutions, AEO and agent readiness, ecommerce, and brand strategy.",
			tags: ["Services", "Web Development", "AI", "AEO", "Brand"],
			url: "/services",
		},
		{
			type: "page",
			title: "Testimonials",
			blurb: "What clients say about working with Lightning Jar.",
			tags: ["Clients", "Reviews", "Testimonials"],
			url: "/testimonials",
		},
		{
			type: "page",
			title: "Fun",
			blurb:
				"Side projects from the studio: open-source experiments, instruments, and toys we built because the itch was there.",
			tags: ["Side Projects", "Experiments", "Play"],
			url: "/fun",
		},
		{
			type: "page",
			title: "Built With",
			blurb:
				"The full technology inventory of this site: every framework, library, service, and standard lightningjar.com is built on.",
			tags: ["Technology", "Stack", "Transparency"],
			url: "/built-with",
		},
		{
			type: "page",
			title: "Research at Lightning Jar",
			blurb:
				"The open research program: pre-registered studies delivering practical guidance for developers of LLM applications.",
			tags: ["Research", "Benchmarks", "LLMs"],
			url: "/research",
		},
		{
			type: "page",
			title: "The Builder's Playbook",
			blurb:
				"Ten measured guidelines for building document-editing apps with LLM agents, distilled from the Barkup Bench series.",
			tags: ["Research", "Playbook", "Barkup Bench", "LLMs"],
			url: "/research/barkup-bench/playbook",
		},
		{
			type: "page",
			title: "The Agent-Readiness & AEO Playbook",
			blurb:
				"Eight evidence-checked guidelines for site owners and agent builders, pairing prevailing agent-readiness advice with what our studies measured.",
			tags: ["Research", "Playbook", "AEO Bench", "Agent Readiness"],
			url: "/research/aeo-bench/playbook",
		},
		...articles.map((article): SearchRecord => {
			const fm = article.frontMatter;
			return {
				type: "blog",
				title: fm.title ?? "",
				blurb: blurb(fm.description),
				tags: fm.tags ?? [],
				url: `/blog/${fm.slug}`,
			};
		}),
		...benchStudies.studies.map(
			(study): SearchRecord => ({
				type: "study",
				title: `Study ${study.letters}: ${study.title}`,
				blurb: blurb(study.indexLine),
				tags: [study.track],
				url: `/research/barkup-bench/${study.slug}`,
			}),
		),
		...aeoStudies.studies.map(
			(study): SearchRecord => ({
				type: "study",
				title: `AEO Study ${study.letters}: ${study.title}`,
				blurb: blurb(study.indexLine),
				tags: [study.track, "AEO Bench"],
				url: `/research/aeo-bench/${study.slug}`,
			}),
		),
		...stories.map(
			(story): SearchRecord => ({
				type: "customer-story",
				title: story.title ?? "",
				blurb: blurb(story.excerpt),
				tags: story.tags ?? [],
				url: `/customer-stories/${story.slug}`,
			}),
		),
		...readingList.map(
			(entry): SearchRecord => ({
				type: "reading-list",
				title: entry.title ?? "",
				blurb: blurb(entry.summary ?? entry.excerpt),
				tags: entry.tags ?? [],
				url: `/reading-list/${entry.slug}`,
			}),
		),
		...allTechnologies.map(
			(tech): SearchRecord => ({
				type: "technology",
				title: tech.name,
				blurb: blurb(tech.shortDescription),
				tags: [tech.category, tech.supercategory ?? ""].filter(Boolean),
				url: `/technologies/${tech.id}`,
			}),
		),
		...allPackages.map(
			(pkg): SearchRecord => ({
				type: "package",
				title: pkg.name,
				blurb: blurb(pkg.tagline),
				tags: [pkg.category, pkg.status].filter(Boolean),
				url: `/packages/${pkg.id}`,
			}),
		),
	];

	return json(
		{ records },
		{
			headers: {
				"cache-control": "public, s-maxage=300, stale-while-revalidate=3600",
			},
		},
	);
};
