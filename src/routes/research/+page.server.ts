// shared headline numbers: src/lib/data/research-stats.json
import researchStats from "$data/research-stats.json";

const studiesSentenceCase =
	researchStats.barkupBench.studiesSpelled.charAt(0).toUpperCase() +
	researchStats.barkupBench.studiesSpelled.slice(1);

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
