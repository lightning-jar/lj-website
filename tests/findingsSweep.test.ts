import { describe, expect, test } from "bun:test";
import {
	diffClaims,
	extractClaims,
	parseFeedTitles,
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

	test("extraction against the real stem-shovel corpus finds the known shape", () => {
		const path = `${process.env.HOME}/projects/stem-shovel/FINDINGS.md`;
		const md = require("node:fs").readFileSync(path, "utf8") as string;
		const claims = extractClaims(md);
		// the corpus is large and every claim is a bolded lead sentence
		expect(claims.length).toBeGreaterThan(80);
		expect(claims.some((c) => c.includes("downmixes to mono"))).toBe(true);
	});
});
