import { json } from "@sveltejs/kit";

import { getAllBlogArticles } from "$content/getters/getBlogArticles";
import { getAllCustomerStories } from "$content/getters/getCustomerStories";
import { getAllReadingListArticles } from "$content/getters/getReadingList";
import { allTechnologies } from "$content/getters/getTechnologiesContent";
import type { SearchRecord } from "$utils/siteSearch";

import benchStudies from "../research/barkup-bench/bench-studies.json";

import type { RequestHandler } from "./$types";

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
