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
	{
		name: "Donut Shooter",
		status: "Live",
		summary:
			"A small browser arcade game: donuts rain from the sky, the shooter follows your mouse, and you click to blast them before they hit the ground. Miss three and it's game over. Under the hood there is no game loop at all: motion runs on closed-form animation curves, and every collision is computed the instant you fire.",
		links: [
			{
				label: "Play at donutshooter.com",
				href: "https://www.donutshooter.com",
			},
			{
				label: "GitHub",
				href: "https://github.com/kevinpeckham/donut-shooter",
			},
		],
	},
	{
		name: "Numberoo",
		status: "Live",
		summary:
			"A number-naming toy for children, inspired by our principal's son Leo, who came home from kindergarten fascinated by how big numbers could get. Type any number, up to a googol (a one followed by a hundred zeros), and Numberoo names it in English and reads it aloud, from seven to quattuorvigintillion and beyond.",
		links: [
			{ label: "Play at numberoo.dev", href: "https://www.numberoo.dev" },
			{ label: "GitHub", href: "https://github.com/kevinpeckham/numberoo" },
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
