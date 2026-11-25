const projects = [
	{
		name: "Stem Shovel",
		status: "Live / BETA",
		summary:
			"Stem Shovel is a web app for managing songwriting, arranging, and recording projects with an emphasis on creativity and collaboration. Built by musicians for musicians, this web-app is intended to be an easy-to-use and affordable location for storing and sharing demos, stems, lyrics, chord charts and other songwriting assets.",
		links: [
			{ label: "Stem Shovel", href: "https://www.stemshovel.com" },
			{ label: "GitHub", href: "https://github.com/kevinpeckham/stem-shovel" },
		],
	},
	{
		name: "Palette Chord Player",
		status: "Live / Part of Stem Shovel",
		summary:
			"An electronic instrument that plays chords through a circle-of-fifths interface. Click around the wheel to hear how keys relate, find the chords that belong together, and sketch out a progression. Helpful for beginning songwriters, and for anyone who thinks better with their ears than with theory books. It began as a standalone project called Fifths and now lives inside Stem Shovel as one of its free instruments, where it plays the piano's sounds. The old fifths.app address still leads to it.",
		links: [
			{
				label: "Play the chord player",
				href: "https://www.stemshovel.com/chord-player",
			},
			{
				label: "Original GitHub repo",
				href: "https://github.com/kevinpeckham/chord-player",
			},
		],
	},
	{
		name: "OK Tuner",
		status: "Live",
		summary:
			"A free chromatic tuner that runs in the browser. Switch it on, play a note, and it shows the nearest note, how many cents sharp or flat you are, and the nearest string of the tuning you picked: guitar, bass, ukulele, or any instrument in chromatic mode. The sound is analyzed on your device and never recorded. It is a port of Stem Shovel's tuner, rebuilt in Foldkit to find out how that framework holds up when an AI coding agent writes most of the code.",
		links: [
			{ label: "Tune up at oktuner.com", href: "https://www.oktuner.com" },
			{
				label: "GitHub",
				href: "https://github.com/kevinpeckham/ok-tuner-foldkit",
			},
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
