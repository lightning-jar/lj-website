const projects = [
	{
		name: "Fifths",
		status: "Live",
		summary:
			"An electronic instrument that plays chords through a circle-of-fifths interface. Click around the wheel to hear how keys relate, find the chords that belong together, and sketch out a progression. Helpful for beginning songwriters, and for anyone who thinks better with their ears than with theory books.",
		links: [
			{ label: "Play at fifths.app", href: "https://www.fifths.app" },
			{ label: "GitHub", href: "https://github.com/kevinpeckham/chord-player" },
		],
	},
];

export function load() {
	return {
		projects,
		meta: {
			title: "Fun | Lightning Jar",
			description:
				"Side projects from the Lightning Jar studio: open-source experiments, instruments, and toys we built because the itch was there.",
			robotsFollow: true,
			analyticsOn: true,
		},
	};
}
