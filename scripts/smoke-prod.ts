/**
 * Production health smoke — external probes of www.lightningjar.com with
 * expected signatures. Runs every 30 minutes via the swamp `prod-smoke`
 * workflow; failures email Kevin via replicator's notify-ops-failure.ts.
 * Ported from replicator's scripts/smoke-prod.ts.
 *
 *   bunx varlock run -- bun scripts/smoke-prod.ts [--base=https://…]
 *
 * Exit codes (swamp contract): 0 = healthy, 2 = check failures, 1 = setup error.
 *
 * Why an external probe here: two failure classes never reach Sentry.
 *   - Init-time crashes. A server bundle that fails to import (replicator's
 *     2026-10-21 /api/mcp ERR_REQUIRE_ESM outage) dies before Sentry
 *     initializes. lj-website ships the same mcp-handler package.
 *   - Quiet CMS loss. cmsJson.ts wraps every replicator fetch in a
 *     last-known-good cache and getFindings.ts degrades to empty on a bad
 *     key, so a revoked key or a CMS outage renders an empty or frozen page
 *     instead of an error. A warm instance can mask this for a while; a
 *     cold one cannot, which is when the collection checks below trip.
 *
 * Checks:
 *   home       GET /                     → 200, SSR shell present (sentry-release marker)
 *   blog       GET /blog                 → 200, ≥ MIN_BLOG article links (CMS: blog)
 *   findings   GET /findings             → 200, ≥ 1 entry link (CMS: findings)
 *   stories    GET /customer-stories     → 200, ≥ 1 entry link (CMS: customer-story)
 *   reading    GET /reading-list         → 200, ≥ 1 entry link (CMS: reading-list)
 *   mcp        POST /mcp initialize      → 200 with serverInfo "lightning-jar"
 *   concierge  GET /api/concierge        → 405 (module loads; POST-only; a 500 is the outage signature)
 *   deployed   live release sha == origin/production (outside the deploy window)
 *
 * The concierge check deliberately does not POST: that would spend AI
 * Gateway credits every 30 minutes. A 405 still proves the route module
 * imported, which is the init-time class this probe exists for.
 *
 * Vercel's Security Checkpoint can challenge plain requests from this VM
 * (403/429 + x-vercel-mitigated: challenge), which reads like an outage but
 * is not one. The smoketest bypass token (SMOKETEST_TOKEN, or
 * ~/.lj-smoketest-token) is sent as x-smoketest-token, matched by a WAF
 * custom rule with action `bypass` on GET requests (same pattern as
 * slx-web). It is sent ONLY to the production origin, never to a --base
 * override, so a hostile --base cannot harvest it.
 */

import {
	assessDeployFreshness,
	parseLiveSha,
} from "#lib/utils/deployFreshness.js";

import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const PROD = "https://www.lightningjar.com";
const baseArg = process.argv.find((a) => a.startsWith("--base="));
const BASE = (baseArg?.split("=")[1] ?? PROD).replace(/\/$/, "");
const TIMEOUT_MS = 15_000;
// 48 articles at port time; a floor well below that catches "the CMS
// answered with a near-empty list" without tripping on normal unpublishing.
const MIN_BLOG = 10;

function smoketestToken(): string | undefined {
	const fromEnv = process.env.SMOKETEST_TOKEN?.trim();
	if (fromEnv) return fromEnv;
	const file = join(homedir(), ".lj-smoketest-token");
	if (!existsSync(file)) return undefined;
	return readFileSync(file, "utf8").trim() || undefined;
}

const TOKEN = BASE === PROD ? smoketestToken() : undefined;

function baseHeaders(): Record<string, string> {
	const h: Record<string, string> = {
		"user-agent": "LightningJarProdSmoke/1.0 (+https://www.lightningjar.com)",
	};
	if (TOKEN) h["x-smoketest-token"] = TOKEN;
	return h;
}

/** A Vercel challenge reads like a 403/429; name it as such. */
function statusProblem(res: Response, want: number): string | null {
	if (res.status === want) return null;
	const mitigated = res.headers.get("x-vercel-mitigated");
	return mitigated
		? `status ${res.status}: Vercel ${mitigated} (firewall), not an app failure; check the smoketest token`
		: `status ${res.status} (want ${want})`;
}

interface Check {
	name: string;
	pass: boolean;
	detail: string;
}
const checks: Check[] = [];

async function probe(
	name: string,
	path: string,
	expect: (res: Response, body: string) => string | null,
	init: RequestInit & { headers?: Record<string, string> } = {},
): Promise<void> {
	try {
		const res = await fetch(`${BASE}${path}`, {
			redirect: "manual",
			signal: AbortSignal.timeout(TIMEOUT_MS),
			...init,
			headers: { ...baseHeaders(), ...init.headers },
		});
		const body = await res.text();
		const problem = expect(res, body);
		checks.push({
			detail: problem ?? `${res.status}`,
			name,
			pass: problem === null,
		});
	} catch (e) {
		checks.push({
			detail: e instanceof Error ? e.message : String(e),
			name,
			pass: false,
		});
	}
}

/** Distinct `<section>/<slug>` links on a listing page (relative or rooted). */
function countEntryLinks(body: string, section: string): number {
	const re = new RegExp(`href="/?${section}/([a-z0-9][a-z0-9-]*)"`, "g");
	return new Set([...body.matchAll(re)].map((m) => m[1])).size;
}

function listing(section: string, min: number) {
	return (res: Response, body: string): string | null => {
		const bad = statusProblem(res, 200);
		if (bad) return bad;
		const n = countEntryLinks(body, section);
		if (n < min) {
			return `${n} entry links (want ≥ ${min}) — CMS fetch or API key likely failing`;
		}
		return null;
	};
}

await probe("home", "/", (res, body) => {
	const bad = statusProblem(res, 200);
	if (bad) return bad;
	if (!body.includes("sentry-release=")) {
		return "SSR shell marker missing (sentry-release)";
	}
	return null;
});

await probe("blog", "/blog", listing("blog", MIN_BLOG));
await probe("findings", "/findings", listing("findings", 1));
await probe("stories", "/customer-stories", listing("customer-stories", 1));
await probe("reading", "/reading-list", listing("reading-list", 1));

await probe(
	"mcp",
	"/mcp",
	(res, body) => {
		const bad = statusProblem(res, 200);
		if (bad) return bad;
		if (!body.includes('"lightning-jar"')) {
			return "initialize response missing serverInfo lightning-jar";
		}
		return null;
	},
	{
		body: JSON.stringify({
			id: 1,
			jsonrpc: "2.0",
			method: "initialize",
			params: {
				capabilities: {},
				clientInfo: { name: "lj-prod-smoke", version: "1" },
				protocolVersion: "2025-06-18",
			},
		}),
		headers: {
			accept: "application/json, text/event-stream",
			"content-type": "application/json",
		},
		method: "POST",
	},
);

await probe("concierge", "/api/concierge", (res) => {
	return statusProblem(res, 405);
});

// ---- deployed: is production serving what `production` holds? -------------
// Only meaningful against the real production host; a --base override (local
// or preview) has no branch to compare against.
if (BASE === PROD) {
	const REPO = new URL("..", import.meta.url).pathname;
	const REF = "origin/production";

	/** origin/production's sha + commit time, or nulls if git is unreachable. */
	async function expectedHead(): Promise<{
		sha: string | null;
		committedAt: Date | null;
	}> {
		try {
			// Fetch first: a stale remote ref would compare against old news.
			await Bun.spawn(["git", "fetch", "origin", "production", "--quiet"], {
				cwd: REPO,
				stderr: "ignore",
				stdout: "ignore",
			}).exited;
			const read = async (args: string[]) => {
				const p = Bun.spawn(["git", ...args], {
					cwd: REPO,
					stderr: "ignore",
					stdout: "pipe",
				});
				const out = (await new Response(p.stdout).text()).trim();
				return (await p.exited) === 0 ? out : "";
			};
			const sha = await read(["rev-parse", REF]);
			const iso = await read(["show", "-s", "--format=%cI", REF]);
			const at = iso ? new Date(iso) : null;
			return {
				committedAt: at && !Number.isNaN(at.getTime()) ? at : null,
				sha: /^[0-9a-f]{40}$/.test(sha) ? sha : null,
			};
		} catch {
			return { committedAt: null, sha: null };
		}
	}

	let liveSha: string | null = null;
	try {
		// Cache-bust so a CDN copy can't report a sha that is no longer served.
		const res = await fetch(`${BASE}/?deploy-check=${Date.now()}`, {
			headers: baseHeaders(),
			signal: AbortSignal.timeout(TIMEOUT_MS),
		});
		liveSha = parseLiveSha(await res.text());
	} catch {
		liveSha = null;
	}

	const head = await expectedHead();
	const verdict = assessDeployFreshness({
		expectedCommittedAt: head.committedAt,
		expectedSha: head.sha,
		liveSha,
		now: new Date(),
	});
	checks.push({
		detail: verdict.detail,
		name: "deployed",
		pass: !verdict.failing,
	});
}

const failures = checks.filter((c) => !c.pass);
console.log(
	`prod smoke (${BASE}): ${checks.length - failures.length}/${checks.length} healthy`,
);
for (const c of checks) {
	console.log(`  ${c.pass ? "OK  " : "FAIL"} ${c.name} — ${c.detail}`);
}
if (failures.length > 0) {
	console.log(`FINDINGS: ${failures.length} failing checks`);
	process.exit(2);
}
console.log("CLEAN");
process.exit(0);
