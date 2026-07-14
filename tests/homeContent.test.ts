import { describe, expect, it } from "bun:test";
import researchStats from "../src/lib/data/research-stats.json";
import { homeContent } from "../src/lib/content/getters/getHomeContent";

// research-stats.json is the single source of truth for barkup-bench
// headline numbers; the home page consumes it via {{placeholder}}
// interpolation and must never render a raw token.
describe("home content interpolation", () => {
	it("research stats provide every substituted field", () => {
		expect(researchStats.studiesSpelled).toMatch(/^[a-z-]+$/);
		expect(researchStats.scoredRunsDisplay).toMatch(/^[\d,]+$/);
		expect(researchStats.modelsSpelled).toMatch(/^[a-z-]+$/);
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
		expect(text).toContain(researchStats.scoredRunsDisplay);
		expect(text).toContain(researchStats.studiesSpelled);
	});
});
