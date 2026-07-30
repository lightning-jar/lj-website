// The curated site index prefetched into the concierge's system prompt
// (AEO Bench Study 3: index-in-context beat the tool round-trip 9.4k vs
// 13.5k input tokens per solved task on haiku-4.5, and beat hint-style
// discovery 4.4x; the everything-index cost 2.68x for zero added
// accuracy, so this is deliberately CURATED — sections, every study,
// package names, the overview pages, and pointers to search_content for
// the long collections, NOT an inline dump of every blog/reading entry).
//
// Pure and deterministic: it takes its dynamic inputs (counts, package
// names) as arguments so it imports no `import.meta.glob` module and
// stays unit-testable. Study data rides in as plain JSON. The output
// must be byte-stable for the same inputs — it is the cached static
// block of the system prompt.

import aeoStudies from "../../routes/research/aeo-bench/aeo-studies.json";
import benchStudies from "../../routes/research/barkup-bench/bench-studies.json";

const STUDY_PROJECTS = [
	{ project: "barkup-bench", studies: benchStudies.studies },
	{ project: "aeo-bench", studies: aeoStudies.studies },
];

export interface SiteIndexInput {
	blogArticles: number;
	readingListEntries: number;
	packages: { name: string; id: string }[];
}

export function buildSiteIndex(input: SiteIndexInput): string {
	const lines: string[] = [];

	lines.push("Sections (root-relative paths):");
	lines.push("- / — home");
	lines.push(
		"- /about, /services, /testimonials, /terms, /fun, /built-with — studio overview pages (read via read_page)",
	);
	lines.push("- /technologies — the stack we build on");
	lines.push("- /packages — our open-source packages");
	lines.push(
		"- /research/barkup-bench, /research/aeo-bench — research dashboards; /research/barkup-bench/playbook — the builder's playbook",
	);
	lines.push("");

	lines.push(
		`Blog: ~${input.blogArticles} articles at /blog/<slug> — use search_content(collection:"blog").`,
	);
	lines.push(
		`Reading list: ~${input.readingListEntries} entries at /reading-list/<slug> — use search_content(collection:"reading-list").`,
	);
	lines.push(
		'Customer stories at /customer-stories/<slug> — use search_content(collection:"customer-story").',
	);
	lines.push("");

	lines.push("Open-source packages:");
	for (const p of input.packages) lines.push(`- ${p.name} — /packages/${p.id}`);
	lines.push("");

	lines.push("Research studies (read_study by slug for full findings):");
	for (const { project, studies } of STUDY_PROJECTS) {
		for (const s of studies) {
			lines.push(`- /research/${project}/${s.slug} — ${s.letters}: ${s.title}`);
		}
	}

	return lines.join("\n");
}
