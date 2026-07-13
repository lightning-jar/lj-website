// data
import { allBlogArticles } from "$content/getters/getBlogArticles";

// The benchmark series, in narrative (chronological) order.
const seriesSlugs = [
	"ast-as-html",
	"barkup-bench-results",
	"tool-history-footgun",
	"barkup-0-2-anchored-patches",
	"we-found-the-crossover",
	"the-model-doesnt-need-to-see-your-tree",
	"your-agents-session-is-drifting",
	"barkup-0-3-focused-views",
	"stable-ids-are-all-you-need",
	"the-benchmark-said-no",
	"then-we-found-the-cheap-part",
	"barkup-0-4-content-search",
	"two-examples-replace-a-memory",
	"barkup-0-5-deterministic-selection",
	"the-thirty-sixth-edit",
	"the-two-things-your-agent-cant-see",
	"views-carry-values-memos-carry-goals",
	"who-writes-the-memo",
	"undo-that",
	"hand-it-everything-it-needs",
	"the-rule-you-forgot-you-wrote",
];

const articles = seriesSlugs
	.map((slug) => {
		const article = allBlogArticles.find((a) => a.frontMatter?.slug === slug);
		if (!article) {
			console.warn(`barkup-bench series post not found: ${slug}`);
			return null;
		}
		const fm = article.frontMatter;
		return {
			slug,
			title: typeof fm?.title === "string" ? fm.title : slug,
			date: typeof fm?.date === "string" ? fm.date : "",
		};
	})
	.filter((a): a is { slug: string; title: string; date: string } => a !== null)
	.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

const packages = [
	{
		name: "@kevinpeckham/barkup",
		tagline:
			"The library the benchmark shaped. A grammar codec for authoring typed trees as HTML, plus everything the studies validated: id-anchored patches, focused views, content search, and deterministic selection. Every feature was gated on a pre-registered study before it shipped.",
		links: [
			{ label: "GitHub", href: "https://github.com/kevinpeckham/barkup" },
			{
				label: "npm",
				href: "https://www.npmjs.com/package/@kevinpeckham/barkup",
			},
		],
	},
	{
		name: "barkup-bench",
		tagline:
			"The harness itself. Pre-registered briefs, task corpora, committed seeds, the full REPORT.md, and every correction, published as found.",
		links: [
			{
				label: "GitHub",
				href: "https://github.com/kevinpeckham/barkup-bench",
			},
		],
	},
	{
		name: "@kevinpeckham/barkdown",
		tagline:
			"The sibling package. A Markdown round-trip codec born from the same discipline of testable guarantees: one round trip canonicalizes any document, a second is byte-identical.",
		links: [
			{ label: "GitHub", href: "https://github.com/kevinpeckham/barkdown" },
			{
				label: "npm",
				href: "https://www.npmjs.com/package/@kevinpeckham/barkdown",
			},
		],
	},
];

export function load() {
	return {
		articles,
		packages,
		meta: {
			title: "barkup-bench: Open Research on LLM Tree Editing",
			description:
				"barkup-bench is Lightning Jar's open, pre-registered benchmark series measuring how LLMs read and edit structured document trees: twenty-six studies, more than 22,000 scored model runs, published as found, corrections included.",
			robotsFollow: true,
			analyticsOn: true,
		},
	};
}
