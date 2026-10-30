// shared headline numbers: src/lib/data/research-stats.json
import researchStats from "#lib/data/research-stats.json";

const sentenceCase = (word: string) =>
	word.charAt(0).toUpperCase() + word.slice(1);
const studiesSentenceCase = sentenceCase(
	researchStats.barkupBench.studiesSpelled,
);

const projects = [
	{
		name: "AEO Bench",
		slug: "aeo-bench",
		status: "Active",
		summary:
			"An open, pre-registered benchmark measuring whether agent-readiness and answer-engine-optimization techniques (llms.txt, sitemap.xml, markdown content negotiation) measurably help AI agents use websites. Study 1: 900 scored agent runs across five models against a controlled 40-page fixture, with token cost as a first-class outcome. Results published as found, corrections included.",
	},
	{
		name: "Barkup Bench",
		slug: "barkup-bench",
		status: "Active",
		summary: `An open, pre-registered benchmark series measuring how large language models read and edit structured document trees. ${studiesSentenceCase} studies, more than ${researchStats.barkupBench.scoredRunsDisplay} scored model runs, ${researchStats.barkupBench.modelsSpelled} models, trees from 5 to 1,000 nodes, sessions up to 36 edits. Results published as found, corrections included; every finding shipped into the open-source barkup library.`,
	},
	{
		name: "Stem Bench",
		slug: "stem-bench",
		status: "Active",
		// Keep this tile as short as its siblings: per-study detail belongs on
		// /research/stem-bench, and the numbers come from research-stats.json.
		summary: `An open, pre-registered benchmark series measuring the AI features of Stem Shovel, Lightning Jar's music collaboration app. ${sentenceCase(researchStats.stemBench.studiesSpelled)} studies, ${researchStats.stemBench.scoredRunsDisplay} scored cells, ${researchStats.stemBench.modelsSpelled} models, from chart drafting and sheet-music reading to whether a model can hear a song at all. Results published as found, gate letters and corrections included.`,
	},
];

export function load() {
	return {
		projects,
		meta: {
			title: "Research | Lightning Jar",
			description:
				"Lightning Jar's open research program: pre-registered studies delivering practical, evidence-backed guidance for developers of LLM applications.",
			robotsFollow: true,
			analyticsOn: true,
		},
	};
}
