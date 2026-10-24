// data

// types
import type { FrontMatter } from "#lib/types/FrontMatter.js";

import { getAllBlogArticles } from "#lib/content/getters/getBlogArticles.js";

// The benchmark series, in narrative (chronological) order. Empty until
// the first stem-bench article publishes; the section is length-guarded.
const seriesSlugs: string[] = [];

function buildSeriesArticles(allBlogArticles: { frontMatter: FrontMatter }[]) {
	return seriesSlugs
		.map((slug) => {
			const article = allBlogArticles.find((a) => a.frontMatter?.slug === slug);
			if (!article) {
				console.warn(`stem-bench series post not found: ${slug}`);
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
		name: "stem-bench",
		tagline:
			"The harness itself. Pre-registered briefs, the hand-authored progression corpus, deterministic synthesis, the production-pinned transcription and prompt pipeline, mechanical graders, and the full REPORT.md, published as found. Apache-2.0.",
		links: [
			{ label: "GitHub", href: "https://github.com/kevinpeckham/stem-bench" },
		],
	},
];

export async function load({ fetch }) {
	const articles = seriesSlugs.length
		? buildSeriesArticles(await getAllBlogArticles(fetch))
		: [];
	return {
		articles,
		packages,
		meta: {
			title: "Stem Bench: Open Research on AI Features in Production",
			description:
				"Stem Bench is Lightning Jar's open, pre-registered benchmark series measuring the AI features of Stem Shovel, its music collaboration app: 320 scored cells across five models in Study 1, ground truth by construction, published as found.",
			robotsFollow: true,
			analyticsOn: true,
		},
	};
}
