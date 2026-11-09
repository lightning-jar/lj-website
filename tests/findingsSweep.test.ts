import { describe, expect, test } from "vitest";
import {
	areaFor,
	descriptionFrom,
	extractEntries,
	SOURCE_META,
	slugFromClaim,
} from "../scripts/findings-draft-stubs";
import {
	diffClaims,
	extractClaims,
	isClaimLike,
	parseFeedTitles,
	SOURCES,
} from "../scripts/findings-sweep";

describe("findings sweep", () => {
	test("extracts bolded lead claims from finding-shaped bullets", () => {
		const md = [
			"## Web Audio",
			"",
			"- **An `AnalyserNode` downmixes to mono.** For anything that needs",
			"  the channels apart, split first.",
			"- **iOS starts an `AudioContext` suspended, resumes it slowly, and the",
			"  promise from `resume()` may never settle.** A note scheduled early",
			"  sat at time zero.",
			"- not a finding bullet, no bold lead",
			"* **Asterisk bullets count too.** Receipt here.",
		].join("\n");
		const claims = extractClaims(md);
		expect(claims).toEqual([
			"An `AnalyserNode` downmixes to mono.",
			"iOS starts an `AudioContext` suspended, resumes it slowly, and the promise from `resume()` may never settle.",
			"Asterisk bullets count too.",
		]);
	});

	test("diff reports only claims absent from the previous snapshot", () => {
		const prev = ["Old claim one.", "Old claim two."];
		const curr = ["Old claim one.", "Old claim two.", "Brand new claim."];
		expect(diffClaims(prev, curr)).toEqual(["Brand new claim."]);
		// unchanged → empty; case drift does not resurrect a claim
		expect(diffClaims(prev, prev)).toEqual([]);
		expect(diffClaims(["a Claim."], ["A claim."])).toEqual([]);
	});

	test("parses entry titles out of an atom feed", () => {
		const atom = `<?xml version="1.0"?><feed>
			<title>Lightning Jar — Findings</title>
			<entry><id>x</id><title>No. 2: The ring/silent switch mutes
			Web Audio &amp; more</title></entry>
			<entry><title><![CDATA[No. 1: plain title]]></title></entry>
		</feed>`;
		expect(parseFeedTitles(atom)).toEqual([
			"No. 2: The ring/silent switch mutes Web Audio & more",
			"No. 1: plain title",
		]);
	});

	test("heading-style corpora: h3/h4 titles are claims, date notes stripped", () => {
		const md = [
			"## Packages",
			"",
			"### `bun pm pack` takes a workspace dependency's version from bun.lock (2026-10-31, render)",
			"",
			"Prose under it, with a **bold phrase** that is not a claim.",
			"",
			"#### The fix",
			"",
			"## Next section",
			"### A smoke test that imports dist by path never reads exports",
		].join("\n");
		expect(extractClaims(md, "headings")).toEqual([
			"`bun pm pack` takes a workspace dependency's version from bun.lock",
			"A smoke test that imports dist by path never reads exports",
		]);
		// the h4 "The fix" is a label inside the entry, not a claim
	});

	test("section labels and study verdicts are not claims", () => {
		for (const label of [
			"Colors",
			"Folders:",
			"The fix.",
			"Lessons.",
			"Since then.",
			"Landed the same day:",
			"One Svelte.",
			"Study 30 (stem-bench ad39959, ~$0.15): downbeat disambiguation failed",
			"CORRECTION 2 (same day): the fixture carried phantom bars",
		]) {
			expect(isClaimLike(label), label).toBe(false);
		}
		for (const claim of [
			"`Math.hypot` is slow.",
			"An `AnalyserNode` downmixes to mono.",
			"Tempo units differ.",
		]) {
			expect(isClaimLike(claim), claim).toBe(true);
		}
	});

	test("draft stage knows how to stub every sweep source", () => {
		expect(SOURCES.map((s) => s.name).sort()).toEqual(
			Object.keys(SOURCE_META).sort(),
		);
		for (const s of SOURCES) expect(SOURCE_META[s.name].path).toBe(s.path);
	});

	test("heading entries carry the text under the heading", () => {
		const md = [
			"## Testing",
			"### Bun's mock.module leaks across test files (2026-11-03)",
			"",
			"It replaced the module for the whole process. More text.",
			"#### Fix",
			"Use spyOn.",
			"### Next claim here today",
			"Body two.",
		].join("\n");
		const entries = extractEntries(md, "headings");
		expect(entries.map((e) => e.claim)).toEqual([
			"Bun's mock.module leaks across test files",
			"Next claim here today",
		]);
		expect(entries[0].block).toContain("Use spyOn.");
		expect(entries[0].heading).toBe("Testing");
		expect(descriptionFrom(entries[0])).toBe(
			"It replaced the module for the whole process.",
		);
	});

	test("extraction against the real stem-shovel corpus finds the known shape", () => {
		const path = `${process.env.HOME}/projects/stem-shovel/FINDINGS.md`;
		const md = require("node:fs").readFileSync(path, "utf8") as string;
		const claims = extractClaims(md);
		// the corpus is large and every claim is a bolded lead sentence
		expect(claims.length).toBeGreaterThan(80);
		expect(claims.some((c) => c.includes("downmixes to mono"))).toBe(true);
	});
});

describe("findings draft stubs", () => {
	const md = [
		"# Findings",
		"",
		"## Web Audio",
		"",
		"- **An `AnalyserNode` downmixes to mono.** For anything that needs",
		"  the channels apart, split first (`#readLoudness`, D3).",
		"",
		"## Database and tooling",
		"",
		"- **The dev server serves code live; the build needs a restart.** A",
		"  Svelte edit is in the next page load.",
	].join("\n");

	test("extracts full entry blocks with their nearest heading", () => {
		const entries = extractEntries(md);
		expect(entries.length).toBe(2);
		expect(entries[0].claim).toBe("An `AnalyserNode` downmixes to mono.");
		expect(entries[0].heading).toBe("Web Audio");
		expect(entries[0].block).toContain("split first");
		expect(entries[1].heading).toBe("Database and tooling");
	});

	test("maps headings to series areas with per-source fallback", () => {
		const entries = extractEntries(md);
		expect(areaFor("stem-shovel", entries[0])).toBe("Web Audio");
		expect(areaFor("stem-shovel", entries[1])).toBe("Tooling");
		expect(areaFor("woof-editor", { ...entries[0], heading: "0.2.0" })).toBe(
			"Web Platform",
		);
	});

	test("derives short slugs and first-sentence descriptions", () => {
		const entries = extractEntries(md);
		expect(slugFromClaim(entries[0].claim)).toBe("analysernode-downmixes-mono");
		expect(descriptionFrom(entries[0])).toBe(
			"For anything that needs the channels apart, split first (`#readLoudness`, D3).",
		);
	});
});
