import { SITE_BASE } from "./siteBase";

export const ABOUT_LIGHTNING_JAR = {
		contact: "hello@lightningjar.com",
		founded: 2001,
		founder: "Alan Ruthazer (stepped away from the business)",
		leadership:
			"Kevin Peckham, Principal & Chief Technologist (with the studio since 2011); Alex Cantu, Director of Technology",
			name: "Lightning Jar",
		packages: [
			"https://github.com/kevinpeckham/barkup",
			"https://github.com/kevinpeckham/barkup-bench",
			"https://github.com/kevinpeckham/barkdown",
			"https://github.com/kevinpeckham/aeo-bench",
		],
		summary:
			"Design, build, and brand technology studio. Websites, web applications, and custom software for businesses and civic clients; open LLM research (Barkup Bench, AEO Bench) and open-source libraries (barkup, barkdown, woof-editor); AI-era marketing technology including Replicator, an LLM-powered brand operating system.",
		surfaces: {
			blog: `${SITE_BASE}/blog`,
			customerStories: `${SITE_BASE}/customer-stories`,
			readingList: `${SITE_BASE}/reading-list`,
			research: `${SITE_BASE}/research/barkup-bench`,
			aeoResearch: `${SITE_BASE}/research/aeo-bench`,
			playbook: `${SITE_BASE}/research/barkup-bench/playbook`,
			aeoPlaybook: `${SITE_BASE}/research/aeo-bench/playbook`,
			services: `${SITE_BASE}/services`,
		},
	};
