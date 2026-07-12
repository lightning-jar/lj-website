import home from "$content/landing-pages/home.json";
import researchStats from "$data/research-stats.json";

// Interpolate shared research stats so the home panel can never drift from
// the research pages. Single source: src/lib/data/research-stats.json
const substitutions: Record<string, string> = {
	"{{researchStudies}}": researchStats.studiesSpelled,
	"{{researchRuns}}": researchStats.scoredRunsDisplay,
	"{{researchModels}}": researchStats.modelsSpelled,
};

function interpolate(text: string): string {
	return Object.entries(substitutions).reduce(
		(acc, [token, value]) => acc.replaceAll(token, value),
		text,
	);
}

export const homeContent = {
	...home,
	topics: home.topics.map((topic) => ({
		...topic,
		text: topic.text.map(interpolate),
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
