// shared headline numbers: src/lib/data/research-stats.json
import researchStats from "#lib/data/research-stats.json";

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
	{
		name: "Stem Bench",
		slug: "stem-bench",
		status: "Active",
		summary:
			"An open, pre-registered benchmark series measuring the AI features of Stem Shovel, Lightning Jar's music collaboration app. Fourteen studies, 2,746 scored cells across seven models: hint-following in the chart draft, the beat generator's reasoning-off claim, whether a model can read sheet music, whether the listening layer hears what it claims to hear, the composed chain that caught the confound behind the series' one dated correction, a zero-spend validation of the warning heuristic that correction produced, the re-measurement of the rebuilt song check, the section-detection loophole test that recorded the program's first genuine listening result, a validation registered by the production agent itself and run by the bench to a perfect sheet, a zero-spend stem-analysis study whose summed-envelope verdict vindicated the shipped detector, a neural-baselines rematch on synthetic and real recordings in which the classical code held its ground, a tempo-ladder rule that retires the octave error class by representation, the shipped ladder's own validation requested by the production side, and the thread-closing study in which the patched gate validated and the bench retired its own rule on the record. Results published as found, gate letters and corrections included.",
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
