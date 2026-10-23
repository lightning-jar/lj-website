// scripts/findings-rewrite.ts
//
// Third stage of the findings-sweep workflow: rewrite the mechanical
// draft stubs into complete, house-style entries. The prose comes from
// a headless Claude run (agents write; the harness stays deterministic)
// and every candidate passes mechanical gates before it may touch the
// CMS: no em/en dashes, no ai-writing-tells hits, length bounds, a
// Receipt line, canonical tags only. A stub that fails its gates twice
// stays raw (banner intact) and is reported, never force-published.
//
// Exit codes: 0 = done (stdout JSON says how many rewritten vs left
// raw), 1 = hard setup error. Consumes ops/last-stubs.json written by
// findings-draft-stubs.ts.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const HOME = process.env.HOME ?? "/home/exedev";
const REPO = join(HOME, "projects/lj-website");
const OPS = join(REPO, "ops");
const PROMPT_PATH = join(OPS, "prompts/findings-writer.md");
const TELLS_PATH = join(REPO, "docs/ai-writing-tells.grep");
const WRITER_MODEL = "claude-sonnet-5";

interface Stub {
	articleId: string;
	claim: string;
	block: string;
	source: string;
	number: number;
	area: string;
	project: string;
	verified: string;
	slug: string;
}

interface WriterOutput {
	description: string;
	tags: string[];
	markdown: string;
}

// --- MCP plumbing (same contract as findings-draft-stubs) -------------

async function mcpCall(
	tool: string,
	args: Record<string, unknown>,
): Promise<unknown> {
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

// --- gates -------------------------------------------------------------

export async function gateViolations(
	out: WriterOutput,
	canonicalTags: Set<string>,
): Promise<string[]> {
	const violations: string[] = [];
	const everything = `${out.description}\n${out.markdown}`;
	if (/[—–]/.test(everything)) {
		violations.push("contains an em or en dash");
	}
	const words = out.markdown.trim().split(/\s+/).length;
	if (words < 110 || words > 320) {
		violations.push(`body is ${words} words (need 110 to 320)`);
	}
	if (!/^Receipt: /m.test(out.markdown)) {
		violations.push('missing a line starting with "Receipt: "');
	}
	if (!out.description || out.description.length > 200) {
		violations.push("description missing or over 200 characters");
	}
	const badTags = (out.tags ?? []).filter((t) => !canonicalTags.has(t));
	if (!out.tags?.length || badTags.length) {
		violations.push(
			`tags must be 1 to 4 canonical tags (bad: ${badTags.join(", ") || "none supplied"})`,
		);
	}
	// ai-writing-tells scan via the house pattern file
	const proc = Bun.spawn(["grep", "-Ei", "-f", TELLS_PATH], {
		stdin: new Blob([everything]),
		stdout: "pipe",
		stderr: "ignore",
	});
	const hits = (await new Response(proc.stdout).text()).trim();
	await proc.exited;
	if (hits) {
		violations.push(
			`ai-writing-tells scan hits: ${hits.split("\n").slice(0, 3).join(" | ")}`,
		);
	}
	return violations;
}

// --- writer ------------------------------------------------------------

async function runWriter(prompt: string): Promise<WriterOutput> {
	// stdin ignored (claude waits 3s for piped stdin otherwise); nested
	// Claude Code env vars stripped so the headless run is a clean session
	const env = { ...process.env };
	delete env.CLAUDECODE;
	delete env.CLAUDE_CODE_ENTRYPOINT;
	const proc = Bun.spawn(["claude", "-p", prompt, "--model", WRITER_MODEL], {
		stdin: "ignore",
		stdout: "pipe",
		stderr: "pipe",
		env,
	});
	const timer = setTimeout(() => proc.kill(), 240_000);
	const text = (await new Response(proc.stdout).text()).trim();
	clearTimeout(timer);
	if ((await proc.exited) !== 0) {
		const err = await new Response(proc.stderr).text();
		throw new Error(`writer exited nonzero: ${err.slice(0, 200)}`);
	}
	// tolerate accidental fences around the JSON
	const json = text.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "");
	const start = json.indexOf("{");
	const end = json.lastIndexOf("}");
	if (start === -1 || end === -1) throw new Error("writer returned no JSON");
	return JSON.parse(json.slice(start, end + 1)) as WriterOutput;
}

function buildPrompt(
	base: string,
	stub: Stub,
	tags: string[],
	violations?: string[],
): string {
	const correction = violations?.length
		? `\n\nYOUR PREVIOUS ATTEMPT FAILED THESE MECHANICAL GATES, fix them:\n- ${violations.join("\n- ")}`
		: "";
	return [
		base,
		"\n---\n",
		`ENTRY TO WRITE: Findings No. ${stub.number}`,
		`Claim (the title, keep meaning identical): ${stub.claim}`,
		`Area: ${stub.area} · Project: ${stub.project}`,
		`Canonical tags to choose from: ${tags.join(", ")}`,
		"\nSOURCE MATERIAL (verbatim, your only source of facts):\n",
		stub.block,
		`\n(Source document: ${stub.source})`,
		correction,
	].join("\n");
}

// --- main ---------------------------------------------------------------

async function main() {
	const stubsPath = join(OPS, "last-stubs.json");
	if (!existsSync(stubsPath)) {
		console.log(JSON.stringify({ rewritten: 0, note: "no stubs file" }));
		return;
	}
	const stubs = JSON.parse(readFileSync(stubsPath, "utf8")) as Stub[];
	if (stubs.length === 0) {
		console.log(JSON.stringify({ rewritten: 0, note: "nothing to do" }));
		return;
	}
	const basePrompt = readFileSync(PROMPT_PATH, "utf8");
	const tagCatalog = (await mcpCall("tags_list", {})) as {
		tags: { name: string }[];
	};
	const tagNames = tagCatalog.tags.map((t) => t.name);
	const canonical = new Set(tagNames);

	const rewritten: { number: number; title: string }[] = [];
	const leftRaw: { number: number; title: string; reason: string }[] = [];

	for (const stub of stubs) {
		try {
			let out = await runWriter(buildPrompt(basePrompt, stub, tagNames));
			let violations = await gateViolations(out, canonical);
			if (violations.length) {
				out = await runWriter(
					buildPrompt(basePrompt, stub, tagNames, violations),
				);
				violations = await gateViolations(out, canonical);
			}
			if (violations.length) {
				leftRaw.push({
					number: stub.number,
					title: stub.claim,
					reason: violations.join("; "),
				});
				continue;
			}
			await mcpCall("article_update", {
				articleId: stub.articleId,
				frontmatter: {
					title: stub.claim.replace(/\.$/, ""),
					slug: stub.slug,
					description: out.description,
					number: stub.number,
					area: stub.area,
					project: stub.project,
					verified: stub.verified,
					tags: out.tags,
				},
				markdown: out.markdown,
				versionLabel: "house-style rewrite (automated writer)",
			});
			rewritten.push({ number: stub.number, title: stub.claim });
		} catch (e) {
			leftRaw.push({
				number: stub.number,
				title: stub.claim,
				reason: String(e).slice(0, 200),
			});
		}
	}

	console.log(JSON.stringify({ rewritten, leftRaw }, null, 2));
}

if (import.meta.main) {
	await main();
}
