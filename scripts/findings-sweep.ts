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

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const HOME = process.env.HOME ?? "/home/exedev";

export type ClaimStyle = "bullets" | "headings";

export interface Source {
	name: string;
	path: string;
	/** How the corpus marks a claim (see extractClaims). */
	style: ClaimStyle;
	/**
	 * Read the file at this git ref instead of the working tree. For
	 * shared checkouts whose branch other sessions switch: the sweep must
	 * not see a feature branch's notes come and go.
	 */
	gitRef?: string;
}

// Finding-shaped corpora. A source added here is baselined on its first
// sweep (its existing claims are recorded, not reported), so adding one
// never floods the CMS with old material. The SecureLogix portal is left
// out on purpose: it is a client project, and stubs would carry its
// details into the CMS.
export const SOURCES: Source[] = [
	{
		name: "stem-shovel",
		path: join(HOME, "projects/stem-shovel/FINDINGS.md"),
		style: "bullets",
	},
	{
		name: "woof-editor",
		path: join(HOME, "projects/woof-editor/CHANGELOG.md"),
		style: "bullets",
	},
	{
		name: "replicator",
		path: join(HOME, "projects/replicator/FINDINGS.md"),
		style: "headings",
	},
	{
		name: "ccrta-website",
		path: join(HOME, "projects/ccrta-website/FINDINGS.md"),
		style: "headings",
	},
	{
		name: "barmark",
		path: join(HOME, "projects/barmark/FINDINGS.md"),
		style: "headings",
		gitRef: "origin/main",
	},
];

const FEED_URL = "https://www.lightningjar.com/findings/atom.xml";

// Bold leads that are section labels inside an entry, not claims. The
// 2026-11-02 sweep turned these into ~50 junk stubs ("Colors", "The fix.").
const LABEL_LEADS =
	/^(the )?(fix|fixes|cause|symptom|receipt|lesson|lessons|since then|why|how to apply|landed the same day)\b[^a-z]*$/i;
// Study verdicts and corrections belong on the research pages.
const RESEARCH_LEADS = /^(stud(y|ies) \d|correction\b)/i;

/** "Title (2026-11-08, score)" → "Title": the date note is not the claim. */
export function stripDateNote(heading: string): string {
	return heading.replace(/\s*\([^()]*\d{4}-\d{2}-\d{2}[^()]*\)$/, "");
}

/** Keep only leads that read as a claim: a sentence, not a label. */
export function isClaimLike(text: string): boolean {
	if (text.endsWith(":")) return false;
	if (text.split(/\s+/).length < 3) return false;
	if (LABEL_LEADS.test(text)) return false;
	if (RESEARCH_LEADS.test(text)) return false;
	return true;
}

/**
 * Claims in a corpus. "bullets": the bolded lead of a list item,
 * `- **claim**` (possibly wrapped). "headings": an h3/h4 title, minus a
 * trailing "(2026-11-08, score)"-style date note.
 */
export function extractClaims(
	markdown: string,
	style: ClaimStyle = "bullets",
): string[] {
	const raw: string[] = [];
	const re =
		style === "headings" ? /^#{3,4} (.+)$/gm : /^[-*] \*\*([\s\S]+?)\*\*/gm;
	let m = re.exec(markdown);
	while (m !== null) {
		let text = m[1].replace(/\s+/g, " ").trim();
		if (style === "headings") {
			text = stripDateNote(text);
		}
		raw.push(text);
		m = re.exec(markdown);
	}
	return raw.filter(isClaimLike);
}

export function readSource(source: Source): string {
	if (!source.gitRef) return readFileSync(source.path, "utf8");
	const repo = dirname(source.path);
	const file = source.path.slice(repo.length + 1);
	// Fetch quietly so origin/main is current; a failed fetch (offline)
	// falls back to the last fetched ref rather than failing the sweep.
	spawnSync("git", ["-C", repo, "fetch", "--quiet", "origin"], {
		timeout: 60_000,
	});
	const shown = spawnSync(
		"git",
		["-C", repo, "show", `${source.gitRef}:${file}`],
		{ encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
	);
	if (shown.status !== 0) {
		throw new Error(`git show ${source.gitRef}:${file} failed in ${repo}`);
	}
	return shown.stdout;
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
	const baselinedSources: string[] = [];
	for (const source of SOURCES) {
		if (!existsSync(source.path)) {
			console.error(`source missing: ${source.path}`);
			process.exit(1);
		}
		const claims = extractClaims(readSource(source), source.style);
		claimsBySource[source.name] = claims;
		const prior = previous?.claimsBySource[source.name];
		// A source with no prior snapshot is baselined, not reported.
		if (prior === undefined) baselinedSources.push(source.name);
		newBySource[source.name] = prior ? diffClaims(prior, claims) : [];
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
		baselinedSources,
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
