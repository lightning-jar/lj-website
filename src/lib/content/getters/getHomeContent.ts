import { interpolateResearchStats } from "#lib/utils/researchStats.js";

import home from "#lib/content/landing-pages/home.json";

// Research numbers in the home topics are {{project.field}} tokens resolved
// from research-stats.json, so the home panel can never drift from the
// research pages.
export const homeContent = {
	...home,
	topics: home.topics.map((topic) => ({
		...topic,
		text: topic.text.map(interpolateResearchStats),
	})),
};

export const homeSitemapSection = {
	name: "Home",
	pages: [
		{
			href: "/",
			description: home.meta.description,
			title: home.meta.title,
			date: "",
		},
	],
};
