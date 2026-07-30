import { describe, expect, it } from "bun:test";
import { homeContent } from "../src/lib/content/getters/getHomeContent";
import researchStats from "../src/lib/data/research-stats.json";

// research-stats.json is the single source of truth for research
// headline numbers (per project + program totals); the home page consumes it via {{placeholder}}
// interpolation and must never render a raw token.
describe("home content interpolation", () => {
	it("research stats provide every substituted field, per project and totals", () => {
		for (const block of [
			researchStats.totals,
			researchStats.barkupBench,
			researchStats.aeoBench,
		]) {
			expect(block.studiesSpelled).toMatch(/^[a-z-]+$/);
			expect(block.scoredRunsDisplay).toMatch(/^[\d,]+$/);
			expect(block.modelsSpelled).toMatch(/^[a-z-]+$/);
		}
	});

	it("no unresolved {{tokens}} remain in any topic paragraph", () => {
		expect(homeContent.topics.length).toBeGreaterThan(0);
		for (const topic of homeContent.topics) {
			for (const paragraph of topic.text) {
				expect(paragraph, `topic "${topic.heading}"`).not.toMatch(/\{\{|\}\}/);
			}
		}
	});

	it("the research panel renders the current stat values", () => {
		const research = homeContent.topics.find((topic) =>
			topic.heading.includes("Research"),
		);
		expect(research).toBeDefined();
		const text = research?.text.join(" ") ?? "";
		expect(text).toContain(researchStats.totals.scoredRunsDisplay);
		expect(text).toContain(researchStats.barkupBench.studiesSpelled);
	});
});
