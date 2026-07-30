// static index of the site's feeds; the feed routes themselves are
// dynamic (CMS-backed) or prerendered (studies), but this listing only
// changes when a feed is added
export const prerender = true;

export function load() {
	return {
		feeds: [
			{
				href: "/atom.xml",
				title: "Everything",
				description:
					"The combined feed: blog articles, customer stories, Barkup Bench research studies, and reading-list entries, newest first.",
			},
			{
				href: "/blog/atom.xml",
				title: "Blog",
				description: "Articles and updates from the Lightning Jar team.",
			},
			{
				href: "/customer-stories/atom.xml",
				title: "Customer Stories",
				description:
					"New case studies as we publish them: the work, the stack, and the outcomes.",
			},
			{
				href: "/research/barkup-bench/atom.xml",
				title: "Barkup Bench Research",
				description:
					"One entry per published study in our open, pre-registered LLM research series.",
			},
			{
				href: "/research/aeo-bench/atom.xml",
				title: "AEO Bench Research",
				description:
					"One entry per published study in our open benchmark series on agent readiness and answer engine optimization.",
			},
			{
				href: "/reading-list/atom.xml",
				title: "Reading List",
				description:
					"Curated articles from around the web, with our summaries.",
			},
		],
		meta: {
			title: "Feeds",
			description:
				"Subscribe to Lightning Jar by Atom feed: the blog, Barkup Bench research studies, the reading list, or everything combined.",
		},
	};
}
