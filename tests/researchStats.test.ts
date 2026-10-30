import { describe, expect, it } from "vitest";
import researchStats from "../src/lib/data/research-stats.json";
import { interpolateResearchStats } from "../src/lib/utils/researchStats";
import stem from "../src/routes/research/stem-bench/stem-content.json";

describe("interpolateResearchStats", () => {
	it("resolves {{project.field}} tokens from research-stats.json", () => {
		expect(
			interpolateResearchStats(
				"{{stemBench.scoredRunsDisplay}} cells, {{totals.modelsSpelled}} models",
			),
		).toBe(
			`${researchStats.stemBench.scoredRunsDisplay} cells, ${researchStats.totals.modelsSpelled} models`,
		);
	});

	it("capitalizes with |cap for sentence starts", () => {
		const spelled = researchStats.stemBench.studiesSpelled;
		expect(
			interpolateResearchStats("{{stemBench.studiesSpelled|cap}} studies"),
		).toBe(`${spelled.charAt(0).toUpperCase()}${spelled.slice(1)} studies`);
	});

	it("leaves text without tokens unchanged", () => {
		expect(interpolateResearchStats("no tokens here")).toBe("no tokens here");
	});

	it("throws on an unknown block or field instead of rendering braces", () => {
		expect(() => interpolateResearchStats("{{stemBench.studys}}")).toThrow(
			/Unknown research-stats token/,
		);
		expect(() =>
			interpolateResearchStats("{{nopeBench.studiesSpelled}}"),
		).toThrow(/Unknown research-stats token/);
	});

	it("throws on a malformed token", () => {
		expect(() => interpolateResearchStats("{{stemBench}}")).toThrow(
			/Malformed research-stats token/,
		);
	});
});

// The Stem Bench hub's Methods & Provenance paragraph carries its counts as
// tokens, so a new study only has to bump research-stats.json.
describe("stem-bench provenance", () => {
	const rendered = interpolateResearchStats(stem.provenance);

	it("renders the current stem-bench numbers", () => {
		expect(rendered).toContain(researchStats.stemBench.scoredRunsDisplay);
		expect(rendered).toContain(
			`${researchStats.stemBench.modelsSpelled} gateway models`,
		);
		expect(rendered.toLowerCase()).toContain(
			`${researchStats.stemBench.studiesSpelled} pre-registered studies`,
		);
	});

	it("keeps the counts as tokens in the source, not literals", () => {
		expect(stem.provenance).toContain("{{stemBench.scoredRunsDisplay}}");
		expect(stem.provenance).not.toContain(
			researchStats.stemBench.scoredRunsDisplay,
		);
	});
});
