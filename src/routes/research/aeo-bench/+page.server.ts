// data

// types
import type { FrontMatter } from "$types/FrontMatter";

import { getAllBlogArticles } from "$content/getters/getBlogArticles";

// The benchmark series, in narrative (chronological) order.
const seriesSlugs = [
	"introducing-aeo-bench",
	"nobody-reads-llms-txt",
	"one-sentence-beats-every-file",
];

function buildSeriesArticles(allBlogArticles: { frontMatter: FrontMatter }[]) {
	return seriesSlugs
		.map((slug) => {
			const article = allBlogArticles.find((a) => a.frontMatter?.slug === slug);
			if (!article) {
				console.warn(`aeo-bench series post not found: ${slug}`);
				return null;
			}
			const fm = article.frontMatter;
			return {
				slug,
				title: typeof fm?.title === "string" ? fm.title : slug,
				date: typeof fm?.date === "string" ? fm.date : "",
			};
		})
		.filter(
			(a): a is { slug: string; title: string; date: string } => a !== null,
		)
		.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

const packages = [
	{
		name: "aeo-bench",
		tagline:
			"The harness itself. Pre-registered briefs, the deterministic Petrel & Pine site fixture, task corpora, mechanical graders, and the full REPORT.md — every correction published as found.",
		links: [
			{ label: "GitHub", href: "https://github.com/kevinpeckham/aeo-bench" },
		],
	},
];

export async function load({ fetch }) {
	const articles = buildSeriesArticles(await getAllBlogArticles(fetch));
	return {
		articles,
		packages,
		meta: {
			title: "AEO Bench: Open Research on Agent Readiness",
			description:
				"AEO Bench is Lightning Jar's open, pre-registered benchmark series measuring whether agent-readiness and answer-engine-optimization techniques measurably help AI agents use websites: 900 scored agent runs across five models in Study 1, published as found, corrections included.",
			robotsFollow: true,
			analyticsOn: true,
		},
	};
}
