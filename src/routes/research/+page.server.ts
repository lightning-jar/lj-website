// shared headline numbers: src/lib/data/research-stats.json
import researchStats from "$data/research-stats.json";

const studiesSentenceCase =
	researchStats.studiesSpelled.charAt(0).toUpperCase() +
	researchStats.studiesSpelled.slice(1);

const projects = [
	{
		name: "Barkup Bench",
		slug: "barkup-bench",
		status: "Active",
		summary: `An open, pre-registered benchmark series measuring how large language models read and edit structured document trees. ${studiesSentenceCase} studies, more than ${researchStats.scoredRunsDisplay} scored model runs, ${researchStats.modelsSpelled} models, trees from 5 to 1,000 nodes, sessions up to 36 edits. Results published as found, corrections included; every finding shipped into the open-source barkup library.`,
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
