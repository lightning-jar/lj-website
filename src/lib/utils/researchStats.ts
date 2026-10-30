import researchStats from "#lib/data/research-stats.json";

// Interpolate {{project.field}} tokens from research-stats.json, the single
// source of truth for research headline numbers, so prose on the home page
// and the research hubs never drifts from the stats.
//
//   {{stemBench.studiesSpelled}}      -> "sixteen"
//   {{stemBench.studiesSpelled|cap}}  -> "Sixteen" (for sentence starts)
//   {{totals.scoredRunsDisplay}}      -> "42,617"
//
// An unknown token throws instead of rendering literal braces: a typo
// should fail the build, not ship "{{stemBench.studys}}" to readers.

type Stats = Record<string, Record<string, string>>;
const stats = researchStats as unknown as Stats;

const TOKEN = /\{\{\s*([A-Za-z]+)\.([A-Za-z]+)(\|cap)?\s*\}\}/g;

export function interpolateResearchStats(text: string): string {
	const out = text.replace(TOKEN, (token, block, field, cap) => {
		const value = stats[block]?.[field];
		if (typeof value !== "string") {
			throw new Error(`Unknown research-stats token ${token}`);
		}
		return cap ? value.charAt(0).toUpperCase() + value.slice(1) : value;
	});
	if (/\{\{|\}\}/.test(out)) {
		throw new Error(`Malformed research-stats token in: ${out.slice(0, 80)}`);
	}
	return out;
}
