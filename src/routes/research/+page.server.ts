const projects = [
	{
		name: "barkup-bench",
		slug: "barkup-bench",
		status: "Active",
		summary:
			"An open, pre-registered benchmark series measuring how large language models read and edit structured document trees. Nineteen studies, more than 13,000 scored model runs, four models, trees from 5 to 1,000 nodes, sessions up to 36 edits. Results published as found, corrections included; every finding shipped into the open-source barkup library.",
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
