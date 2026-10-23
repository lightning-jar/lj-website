// scripts/findings-draft-stubs.ts
//
// Second stage of the swamp findings-sweep workflow: turn the sweep's
// newly detected claims into CMS DRAFT STUBS in the Findings blog, so
// review starts from an entry in the editor rather than a diff in an
// email. Mechanical by design — the stub carries the verbatim source
// block plus a review banner; house-style rewriting stays with humans
// and agents, and nothing here publishes.
//
// Writes go through replicator's stateless MCP endpoint
// (`tools/call` JSON-RPC) using a Bearer org agent key with blog
// scope. Numbering is tracked locally (ops/findings-numbering.json,
// gitignored) because drafts are invisible to the public read API.
//
// Exit codes: 0 = created stubs (count on stdout) or nothing to do,
// 1 = probe/setup error (missing key, MCP failure).
//
// Usage: bun run scripts/findings-draft-stubs.ts [--dry-run]
//        [--report <path>] [--numbering <path>]

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// CLI script: runs under `bunx varlock run -- bun …` (the lj-ops-script
// behavior wraps it), so resolved env arrives via process.env — the
// varlock/env ENV import is for vite-built src/ code, not ops scripts.

const HOME = process.env.HOME ?? "/home/exedev";
const OPS = join(HOME, "projects/lj-website/ops");
const FINDINGS_BLOG_ID = "n52rePFua2SDvsie_srrX";

// Source corpora (keep aligned with findings-sweep.ts SOURCES) plus the
// per-source defaults a stub needs.
const SOURCE_META: Record<
	string,
	{ path: string; project: string; defaultArea: string }
> = {
	"stem-shovel": {
		path: join(HOME, "projects/stem-shovel/FINDINGS.md"),
		project: "Stem Shovel",
		defaultArea: "Browser Platform",
	},
	"woof-editor": {
		path: join(HOME, "projects/woof-editor/CHANGELOG.md"),
		project: "Woof Editor",
		defaultArea: "Web Platform",
	},
};

// FINDINGS.md section headings → series areas.
const AREA_BY_HEADING: Record<string, string> = {
	"web audio": "Web Audio",
	"browser platform": "Browser Platform",
	"svelte and the page": "Web Platform",
	testing: "Testing",
	"database and tooling": "Tooling",
	packages: "Tooling",
};

const TAGS_BY_AREA: Record<string, string[]> = {
	"Web Audio": ["Web Audio", "Browsers"],
	"Browser Platform": ["Browsers"],
	"Web Platform": ["Browsers"],
	Testing: ["Testing"],
	Tooling: ["Developer Tools"],
};

export interface SourceEntry {
	claim: string;
	block: string;
	heading: string | null;
}

/** Every finding-shaped bullet with its full block and nearest heading. */
export function extractEntries(markdown: string): SourceEntry[] {
	const lines = markdown.split("\n");
	const entries: SourceEntry[] = [];
	let heading: string | null = null;
	let current: { startHeading: string | null; lines: string[] } | null = null;

	const flush = () => {
		if (!current) return;
		const block = current.lines.join("\n").trimEnd();
		const m = block.match(/^[-*] \*\*([\s\S]+?)\*\*/);
		if (m) {
			entries.push({
				block,
				claim: m[1].replace(/\s+/g, " ").trim(),
				heading: current.startHeading,
			});
		}
		current = null;
	};

	for (const line of lines) {
		const h = line.match(/^#{2,3} (.+)$/);
		if (h) {
			flush();
			heading = h[1].trim();
			continue;
		}
		if (/^[-*] \*\*/.test(line)) {
			flush();
			current = { startHeading: heading, lines: [line] };
		} else if (current) {
			if (/^\S/.test(line) && line.trim() !== "") {
				// unindented non-bullet text ends the entry
				flush();
			} else {
				current.lines.push(line);
			}
		}
	}
	flush();
	return entries;
}

/** Short kebab slug from a claim's leading significant words. */
export function slugFromClaim(claim: string): string {
	const words = claim
		.toLowerCase()
		.replace(/`/g, "")
		.replace(/[^a-z0-9\s-]/g, "")
		.split(/\s+/)
		.filter((w) => w.length > 1 && !["the", "a", "an", "of", "to"].includes(w));
	return words.slice(0, 5).join("-") || "finding";
}

/** First sentence after the claim (or the claim itself), ~180 chars. */
export function descriptionFrom(entry: SourceEntry): string {
	const afterClaim = entry.block
		.replace(/^[-*] \*\*[\s\S]+?\*\*/, "")
		.replace(/\s+/g, " ")
		.trim();
	const firstSentence = afterClaim.match(/^(.+?[.!?])(\s|$)/)?.[1] ?? "";
	const base = firstSentence || entry.claim;
	return base.length > 180 ? `${base.slice(0, 177)}...` : base;
}

export function areaFor(sourceName: string, entry: SourceEntry): string {
	const byHeading =
		entry.heading && AREA_BY_HEADING[entry.heading.toLowerCase()];
	return byHeading || SOURCE_META[sourceName].defaultArea;
}

// --- MCP plumbing (stateless streamable HTTP) -------------------------

async function mcpCall(
	tool: string,
	args: Record<string, unknown>,
): Promise<unknown> {
	// One retry on transient failure (5xx/network): the live-fire hit a
	// one-off Internal Error that succeeded on replay — cheap insurance,
	// same lesson as Findings No. 12.
	try {
		return await mcpCallOnce(tool, args);
	} catch (e) {
		if (!String(e).includes("HTTP 5") && !String(e).includes("fetch")) throw e;
		await new Promise((r) => setTimeout(r, 3000));
		return await mcpCallOnce(tool, args);
	}
}

async function mcpCallOnce(
	tool: string,
	args: Record<string, unknown>,
): Promise<unknown> {
	const base = (process.env.BLOG_CMS_BASE_URL ?? "").replace(/\/$/, "");
	const key = process.env.REPLICATOR_AGENT_KEY;
	if (!base || !key) {
		throw new Error("BLOG_CMS_BASE_URL / REPLICATOR_AGENT_KEY not set");
	}
	const res = await fetch(`${base}/api/mcp`, {
		method: "POST",
		headers: {
			authorization: `Bearer ${key}`,
			"content-type": "application/json",
			accept: "application/json, text/event-stream",
		},
		body: JSON.stringify({
			jsonrpc: "2.0",
			id: 1,
			method: "tools/call",
			params: { name: tool, arguments: args },
		}),
		signal: AbortSignal.timeout(30_000),
	});
	const text = await res.text();
	if (!res.ok)
		throw new Error(`${tool}: HTTP ${res.status} ${text.slice(0, 200)}`);
	// streamable HTTP may answer as SSE; take the last data: payload
	const payload =
		text.startsWith("event:") || text.includes("\ndata:")
			? (text
					.match(/data: (.+)/g)
					?.at(-1)
					?.slice(6) ?? text)
			: text;
	const parsed = JSON.parse(payload) as {
		error?: { message?: string };
		result?: { isError?: boolean; content?: { text?: string }[] };
	};
	if (parsed.error) throw new Error(`${tool}: ${parsed.error.message}`);
	const inner = parsed.result?.content?.[0]?.text;
	if (parsed.result?.isError) throw new Error(`${tool}: ${inner}`);
	return inner ? JSON.parse(inner) : parsed.result;
}

// --- main -------------------------------------------------------------

async function main() {
	const args = process.argv.slice(2);
	const dryRun = args.includes("--dry-run");
	const flag = (name: string, fallback: string) => {
		const i = args.indexOf(name);
		return i !== -1 ? args[i + 1] : fallback;
	};
	const reportPath = flag("--report", join(OPS, "last-sweep-report.json"));
	const numberingPath = flag(
		"--numbering",
		join(OPS, "findings-numbering.json"),
	);

	if (!existsSync(reportPath)) {
		console.error(`no sweep report at ${reportPath}`);
		process.exit(1);
	}
	const report = JSON.parse(readFileSync(reportPath, "utf8")) as {
		newBySource: Record<string, string[]>;
	};
	const newTotal = Object.values(report.newBySource).reduce(
		(n, l) => n + l.length,
		0,
	);
	if (newTotal === 0) {
		console.log(JSON.stringify({ created: 0, note: "nothing to do" }));
		process.exit(0);
	}

	// Local numbering: drafts are invisible to the public read API, so the
	// next number lives here. Seed/repair manually if humans hand-number.
	const numbering = existsSync(numberingPath)
		? (JSON.parse(readFileSync(numberingPath, "utf8")) as { next: number })
		: { next: 29 };

	const created: { number: number; title: string; previewUrl?: string }[] = [];
	for (const [sourceName, claims] of Object.entries(report.newBySource)) {
		if (claims.length === 0) continue;
		const meta = SOURCE_META[sourceName];
		if (!meta) continue;
		const entries = extractEntries(readFileSync(meta.path, "utf8"));
		for (const claim of claims) {
			const entry = entries.find(
				(e) => e.claim.toLowerCase() === claim.toLowerCase(),
			);
			if (!entry) {
				console.error(`entry vanished from source, skipping: ${claim}`);
				continue;
			}
			const number = numbering.next;
			const area = areaFor(sourceName, entry);
			const title = entry.claim.replace(/\.$/, "");
			const frontmatter = {
				title,
				slug: slugFromClaim(entry.claim),
				description: descriptionFrom(entry),
				number,
				area,
				project: meta.project,
				verified: new Date().toISOString().slice(0, 10),
				tags: TAGS_BY_AREA[area] ?? [],
			};
			const markdown = [
				"> DRAFT STUB, auto-created by the findings-sweep workflow.",
				"> Verify the receipt, rewrite into house style (symptom, cause,",
				"> fix, receipt; no em dashes; scan against ai-writing-tells),",
				"> and renumber if this collides before publishing.",
				"",
				entry.block,
				"",
				`Source: ${sourceName} (${meta.path.split("/projects/")[1]})`,
			].join("\n");

			if (dryRun) {
				console.error(`[dry-run] would create No. ${number}: ${title}`);
				created.push({ number, title });
			} else {
				const res = (await mcpCall("article_create", {
					blogId: FINDINGS_BLOG_ID,
					title,
					frontmatter,
					markdown,
				})) as { articleId: string; draftPreviewUrl?: string };
				await mcpCall("article_update", {
					articleId: res.articleId,
					slug: frontmatter.slug,
				});
				created.push({ number, title, previewUrl: res.draftPreviewUrl });
			}
			numbering.next = number + 1;
		}
	}

	if (!dryRun) {
		writeFileSync(numberingPath, JSON.stringify(numbering, null, "\t"));
	}
	console.log(
		JSON.stringify({ created: created.length, stubs: created }, null, 2),
	);
}

if (import.meta.main) {
	await main();
}
