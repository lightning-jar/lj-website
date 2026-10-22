// scripts/findings-sweep.ts
//
// Findings-series source sweep (the swamp `findings-sweep` workflow's
// probe). Detect-and-report only: extracts the claim list from each
// source corpus (the bolded lead sentence of every finding-shaped
// bullet), diffs it against the previous run's snapshot, and reports
// what appeared since. Publishing stays human; this only answers "is
// there unharvested material?" on a schedule.
//
// Exit codes: 0 = nothing new (or first-run baseline), 3 = new claims
// found (the workflow turns that into an email digest), 1 = probe
// error. State lives in a local JSON snapshot (gitignored); deleting
// it re-baselines.
//
// Usage: bun run scripts/findings-sweep.ts [--state <path>] [--json]

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const HOME = process.env.HOME ?? "/home/exedev";

// Finding-shaped corpora: files whose `- **claim.** prose` bullets are
// the series' raw material. Extend as repos adopt the convention.
const SOURCES: { name: string; path: string }[] = [
	{ name: "stem-shovel", path: join(HOME, "projects/stem-shovel/FINDINGS.md") },
	{
		name: "woof-editor",
		path: join(HOME, "projects/woof-editor/CHANGELOG.md"),
	},
];

const FEED_URL = "https://www.lightningjar.com/findings/atom.xml";

/** Bolded lead sentences of list items: `- **claim**` (possibly wrapped). */
export function extractClaims(markdown: string): string[] {
	const claims: string[] = [];
	const re = /^[-*] \*\*([\s\S]+?)\*\*/gm;
	let m = re.exec(markdown);
	while (m !== null) {
		claims.push(m[1].replace(/\s+/g, " ").trim());
		m = re.exec(markdown);
	}
	return claims;
}

/** Claims in `current` absent from `previous` (normalized exact match). */
export function diffClaims(previous: string[], current: string[]): string[] {
	const seen = new Set(previous.map((c) => c.toLowerCase()));
	return current.filter((c) => !seen.has(c.toLowerCase()));
}

export function parseFeedTitles(atomXml: string): string[] {
	return [
		...atomXml.matchAll(/<entry>[\s\S]*?<title>([\s\S]*?)<\/title>/g),
	].map((m) =>
		m[1]
			.replace(/<!\[CDATA\[|\]\]>/g, "")
			.replace(/&amp;/g, "&")
			.replace(/\s+/g, " ")
			.trim(),
	);
}

interface SweepState {
	claimsBySource: Record<string, string[]>;
	sweptAt: string;
}

async function main() {
	const args = process.argv.slice(2);
	const stateFlag = args.indexOf("--state");
	const statePath =
		stateFlag !== -1
			? args[stateFlag + 1]
			: join(HOME, "projects/lj-website/ops/sweep-state.json");

	const previous: SweepState | null = existsSync(statePath)
		? (JSON.parse(readFileSync(statePath, "utf8")) as SweepState)
		: null;

	const claimsBySource: Record<string, string[]> = {};
	const newBySource: Record<string, string[]> = {};
	for (const source of SOURCES) {
		if (!existsSync(source.path)) {
			console.error(`source missing: ${source.path}`);
			process.exit(1);
		}
		const claims = extractClaims(readFileSync(source.path, "utf8"));
		claimsBySource[source.name] = claims;
		newBySource[source.name] = previous
			? diffClaims(previous.claimsBySource[source.name] ?? [], claims)
			: [];
	}

	// Published-side context (best effort; the sweep's verdict is purely
	// source-side so a feed outage cannot invent or hide candidates).
	let published: { count: number; sample: string[] } | null = null;
	try {
		const res = await fetch(FEED_URL, {
			signal: AbortSignal.timeout(15_000),
		});
		if (res.ok) {
			const titles = parseFeedTitles(await res.text());
			published = { count: titles.length, sample: titles.slice(0, 3) };
		}
	} catch {
		// decorative only
	}

	mkdirSync(dirname(statePath), { recursive: true });
	writeFileSync(
		statePath,
		JSON.stringify(
			{
				claimsBySource,
				sweptAt: new Date().toISOString(),
			} satisfies SweepState,
			null,
			"\t",
		),
	);

	const newCount = Object.values(newBySource).reduce(
		(n, list) => n + list.length,
		0,
	);
	const report = {
		baselined: previous === null,
		newCount,
		newBySource,
		totals: Object.fromEntries(
			Object.entries(claimsBySource).map(([k, v]) => [k, v.length]),
		),
		published,
	};
	// Persisted for the draft-stubs stage (same workflow, next step).
	writeFileSync(
		join(dirname(statePath), "last-sweep-report.json"),
		JSON.stringify(report, null, "\t"),
	);
	console.log(JSON.stringify(report, null, 2));
	process.exit(previous !== null && newCount > 0 ? 3 : 0);
}

if (import.meta.main) {
	await main();
}
