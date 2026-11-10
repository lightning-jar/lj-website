// scripts/deps-update.ts
//
// Weekly dependency update (the swamp `deps-update` workflow).
//
// What moves is strict, because a green update merges with no human
// review: exact pins, "^x.y.z" and bare-major ("^7") ranges only; the
// newest same-line release (same major, same minor under 0.x) that has
// been on npm for 7 days; no prereleases or deprecated versions. Majors
// and too-new releases are listed in the email, never applied. bunfig.toml
// sets the same 7-day rule for ranges and transitive deps, but Bun lets an
// exact pin bypass it, hence the check here.
//
// How it ships (Kevin's call, 2026-11-10, replacing "straight to
// production"): as a pull request into production that merges itself only
// when every required check ends in success: typecheck, biome and vitest
// (.github/workflows/ci.yml, which runs with NO secrets), Socket's
// supply-chain scan and the Vercel preview build. Then dev is
// fast-forwarded to production. A red check, a timeout or a refused merge
// leaves the PR open and emails why.
//
// It runs NO updated package code on this VM. It only rewrites
// package.json and resolves bun.lock with `bun install --lockfile-only`
// (no node_modules, no lifecycle scripts), in its own worktree, with a
// scrubbed environment and no .env.local. The first version installed and
// ran check, tests and build here under varlock: a compromised release
// would have executed next to every project's 1Password tokens before any
// scanner saw it (Vercel's security review on slx-web's port, 2026-11-10).
//
// Exit codes (the workflow branches on these): 0 = nothing to update,
// 3 = merged, 4 = stopped on purpose (lockfile miss, CI red or slow, merge
// refused, last week's PR still open, agent-surface alert), 1 = the script
// itself broke. stdout is the email body; everything else goes to stderr.
//
// Usage: bun scripts/deps-update.ts [--dry-run [--base <ref>]]
// --dry-run stops after planning and resolving the lockfile; --base (dry
// runs only) starts from another ref.

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export const MIN_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export interface Spec {
	/** "" = exact pin, "^" = caret range. */
	prefix: "" | "^";
	/** The full version in the spec, or null for a bare-major range ("^7"). */
	version: string | null;
}

/**
 * "1.2.3", "^1.2.3" or "^7". Anything else (tags, "~", "*", ranges,
 * prereleases, a bare exact "7") is left alone.
 */
export function parseSpec(spec: string): Spec | null {
	const full = /^(\^?)(\d+\.\d+\.\d+)$/.exec(spec);
	if (full) return { prefix: full[1] as Spec["prefix"], version: full[2] };
	if (/^\^\d+$/.test(spec)) return { prefix: "^", version: null };
	return null;
}

/** The spec to write for `target`: pins stay pins, a bare major stays as is. */
export function nextSpec(raw: string, spec: Spec, target: string): string {
	if (spec.version === null) return raw;
	return `${spec.prefix}${target}`;
}

function parts(v: string): [number, number, number] {
	const [a, b, c] = v.split(".").map(Number);
	return [a, b, c];
}

export function compare(a: string, b: string): number {
	const pa = parts(a);
	const pb = parts(b);
	for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i] - pb[i];
	return 0;
}

/** Same release line: same major, and same minor when the major is 0. */
export function sameLine(current: string, candidate: string): boolean {
	const [ma, mi] = parts(current);
	const [cma, cmi] = parts(candidate);
	if (ma !== cma) return false;
	return ma !== 0 || mi === cmi;
}

export interface RegistryDoc {
	versions: Record<string, { deprecated?: string }>;
	time: Record<string, string>;
}

export interface Decision {
	/** Newest eligible version above current, or null. */
	target: string | null;
	/** Newest stable version overall, when it is beyond what may be applied. */
	held: { version: string; reason: string } | null;
}

export function decide(
	current: string,
	doc: RegistryDoc,
	now: number,
	minAgeMs = MIN_AGE_MS,
): Decision {
	const stable = Object.keys(doc.versions).filter(
		(v) => /^\d+\.\d+\.\d+$/.test(v) && !doc.versions[v].deprecated,
	);
	const newer = stable
		.filter((v) => compare(v, current) > 0)
		.sort(compare)
		.reverse();
	const oldEnough = (v: string) => {
		const t = Date.parse(doc.time[v] ?? "");
		return Number.isFinite(t) && now - t >= minAgeMs;
	};
	const target =
		newer.find((v) => sameLine(current, v) && oldEnough(v)) ?? null;
	const newest = newer[0];
	if (!newest || newest === target) return { target, held: null };
	const reason = sameLine(current, newest)
		? `under ${Math.round(minAgeMs / 86_400_000)} days old`
		: "breaking per semver";
	return { target, held: { version: newest, reason } };
}

/**
 * Swap one dependency's spec in package.json text, keeping its layout.
 * Only the `dependencies` and `devDependencies` objects are searched: a
 * script can share a package's name (`"storybook": "storybook dev -p
 * 6006"` sits above the `storybook` devDependency), and a whole-file match
 * would overwrite the script.
 */
export function setSpec(pkgText: string, name: string, spec: string): string {
	const key = JSON.stringify(name).replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
	const entry = new RegExp(`(${key}\\s*:\\s*)"[^"]*"`);
	for (const section of ["dependencies", "devDependencies"]) {
		const open = new RegExp(`"${section}"\\s*:\\s*\\{`).exec(pkgText);
		if (!open) continue;
		const start = open.index + open[0].length;
		const end = pkgText.indexOf("}", start);
		const body = pkgText.slice(start, end);
		if (!entry.test(body)) continue;
		const swapped = body.replace(entry, `$1${JSON.stringify(spec)}`);
		return pkgText.slice(0, start) + swapped + pkgText.slice(end);
	}
	throw new Error(`${name} not found in package.json dependencies`);
}

/** Point biome.json's `$schema` at a new Biome version's schema. */
export function bumpBiomeSchema(text: string, version: string): string {
	return text.replace(
		/(biomejs\.dev\/schemas\/)\d+\.\d+\.\d+(\/schema\.json)/,
		`$1${version}$2`,
	);
}

/** Every "name@version" entry in a bun.lock "packages" section. */
function lockEntries(lockText: string): IterableIterator<RegExpMatchArray> {
	const start = lockText.indexOf('"packages"');
	return lockText
		.slice(start === -1 ? lockText.length : start)
		.matchAll(/^\s+"([^"]+)": \["((?:@[^/"]+\/)?[^@"]+)@([^"]+)"/gm);
}

/** The version bun.lock resolved for a top-level dependency, or null. */
export function lockVersion(lockText: string, name: string): string | null {
	for (const m of lockEntries(lockText)) {
		if (m[1] === name && m[2] === name) return m[3];
	}
	return null;
}

/** Package names in a bun.lock, to spot packages an update newly pulls in. */
export function lockPackageNames(lockText: string): Set<string> {
	const names = new Set<string>();
	for (const m of lockEntries(lockText)) names.add(m[2]);
	return names;
}

/**
 * The email body travels as a workflow input: strip terminal color codes
 * from gate output and swap double quotes, as lj-website's emailSafe does.
 */
/** ESC `[` … `m`: a terminal color code (built from the char code, not a regex literal). */
const ANSI_COLOR = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, "g");

export function emailSafe(text: string): string {
	return text.replace(ANSI_COLOR, "").replace(/"/g, "'");
}

// ---- CI verdict -------------------------------------------------------------

export interface CheckRun {
	name: string;
	status: string;
	conclusion: string | null;
}

export interface CommitStatus {
	context: string;
	state: string;
}

/**
 * Checks that must end in success before the PR may merge: the GitHub
 * Actions jobs (.github/workflows/ci.yml, run with no secrets), Socket's
 * supply-chain scan, and `Vercel`, the preview build. The Vercel reviews
 * are judged when present but not waited for.
 */
export const REQUIRED_CHECKS = [
	"typecheck",
	"vitest",
	"biome",
	"Socket Security: Pull Request Alerts",
	"Vercel",
] as const;

/**
 * A required check passes only on `success`: a skipped or neutral Socket
 * scan or test job must not let an unreviewed update merge. Optional
 * checks (the Vercel reviews, which go neutral when billing is off) may
 * also end neutral or skipped.
 */
const OPTIONAL_PASSING = new Set(["success", "neutral", "skipped"]);

type CheckResult = "pass" | "fail" | "pending";

export type CiVerdict =
	| { state: "pending"; waitingOn: string[] }
	| { state: "green" }
	| { state: "failed"; failed: string[] };

function runResult(r: CheckRun, required: ReadonlySet<string>): CheckResult {
	if (r.status !== "completed") return "pending";
	const conclusion = r.conclusion ?? "";
	if (required.has(r.name)) return conclusion === "success" ? "pass" : "fail";
	return OPTIONAL_PASSING.has(conclusion) ? "pass" : "fail";
}

function statusResult(s: CommitStatus): CheckResult {
	if (s.state === "success") return "pass";
	return s.state === "pending" ? "pending" : "fail";
}

function namesWith(results: Map<string, CheckResult>, want: CheckResult) {
	return [...results].filter(([, v]) => v === want).map(([k]) => k);
}

/** Fold a PR head's check runs and commit statuses into one verdict. */
export function ciVerdict(
	runs: CheckRun[],
	statuses: CommitStatus[],
	required: readonly string[] = REQUIRED_CHECKS,
): CiVerdict {
	const requiredSet = new Set(required);
	const results = new Map<string, CheckResult>([
		...runs.map((r) => [r.name, runResult(r, requiredSet)] as const),
		...statuses.map((s) => [s.context, statusResult(s)] as const),
	]);
	const failed = namesWith(results, "fail");
	if (failed.length) return { state: "failed", failed };
	const waitingOn = [
		...required.filter((name) => !results.has(name)),
		...namesWith(results, "pending"),
	];
	return waitingOn.length
		? { state: "pending", waitingOn }
		: { state: "green" };
}

// ---- main -----------------------------------------------------------------

const REPO = join(import.meta.dirname, "..");
const WORKTREE = join(homedir(), "projects/.worktrees/lj-website-deps");
const GH_REPO = "lightning-jar/lj-website";
const BASE = "production";
const GH_HOST = "github.int.exe.xyz";
const BRANCH_PREFIX = "chore/deps-weekly-";
const CI_WAIT_MS = 30 * 60_000;
const CI_POLL_MS = 30_000;
const COMMIT_FILES = ["package.json", "bun.lock", "biome.json"];

/**
 * The only environment `bun install --lockfile-only` gets: enough to find
 * bun and its cache, none of the varlock-resolved secrets this script runs
 * under.
 */
const SCRUBBED_ENV = {
	PATH: process.env.PATH ?? "/usr/bin:/bin",
	HOME: homedir(),
	TMPDIR: process.env.TMPDIR ?? "/tmp",
};

interface Bump {
	name: string;
	raw: string;
	from: string;
	to: string;
	finalSpec: string;
}

// ---- process helpers --------------------------------------------------------

function sh(
	cmd: string,
	args: string[],
	cwd: string,
	env: NodeJS.ProcessEnv = { ...process.env, GH_HOST },
) {
	const r = spawnSync(cmd, args, {
		cwd,
		encoding: "utf8",
		maxBuffer: 64 * 1024 * 1024,
		timeout: 600_000,
		env,
	});
	process.stderr.write(`$ ${cmd} ${args.join(" ")} -> ${r.status}\n`);
	return { ok: r.status === 0, out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

const git = (args: string[], cwd = WORKTREE) => sh("git", args, cwd);

function gh<T>(args: string[]): T {
	const r = spawnSync("gh", ["api", ...args], {
		encoding: "utf8",
		env: { ...process.env, GH_HOST },
		timeout: 60_000,
	});
	if (r.status !== 0) {
		throw new Error(`gh api ${args[0]} failed: ${r.stderr || r.stdout}`);
	}
	return JSON.parse(r.stdout || "null") as T;
}

function finish(code: number, body: string): never {
	console.log(emailSafe(body));
	process.exit(code);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchDoc(name: string): Promise<RegistryDoc> {
	const url = `https://registry.npmjs.org/${name.replace("/", "%2f")}`;
	const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
	if (!res.ok) throw new Error(`registry ${res.status} for ${name}`);
	return (await res.json()) as RegistryDoc;
}

// ---- steps ------------------------------------------------------------------

interface OpenPr {
	html_url: string;
	head: { ref: string; repo: { full_name: string } | null };
}

/**
 * A stopped week leaves its PR open; don't stack another on top of it.
 * Only branches in this repo count: a fork PR can pick any branch name,
 * and must not be able to switch the updater off.
 */
function guardNoOpenPr() {
	const open = gh<OpenPr[]>([
		`repos/${GH_REPO}/pulls?state=open&per_page=100`,
	]).filter(
		(p) =>
			p.head.repo?.full_name === GH_REPO &&
			p.head.ref.startsWith(BRANCH_PREFIX),
	);
	if (open.length) {
		finish(
			4,
			`Weekly package update did not run: last update's PR is still open. Merge or close it first:\n${open.map((p) => `  ${p.html_url}`).join("\n")}`,
		);
	}
}

function prepareWorktree(baseRef: string): string {
	if (!git(["fetch", "--quiet", "origin"], REPO).ok) {
		throw new Error("git fetch failed");
	}
	if (existsSync(WORKTREE)) {
		git(["worktree", "remove", "--force", WORKTREE], REPO);
		rmSync(WORKTREE, { recursive: true, force: true });
		git(["worktree", "prune"], REPO);
	}
	if (!git(["worktree", "add", "--detach", WORKTREE, baseRef], REPO).ok) {
		throw new Error("git worktree add failed");
	}
	return git(["rev-parse", "--short", "HEAD"]).out.trim();
}

/** One dependency's plan: a bump, a held-back note, both or neither. */
async function planOne(name: string, raw: string, lock: string, now: number) {
	const spec = parseSpec(raw);
	const current = spec && (lockVersion(lock, name) ?? spec.version);
	if (!spec || !current) return { bump: null, held: null };
	const d = decide(current, await fetchDoc(name), now);
	const bump: Bump | null = d.target
		? {
				name,
				raw,
				from: current,
				to: d.target,
				finalSpec: nextSpec(raw, spec, d.target),
			}
		: null;
	const held = d.held ? `${name} ${d.held.version} (${d.held.reason})` : null;
	return { bump, held };
}

async function planBumps(): Promise<{ bumps: Bump[]; held: string[] }> {
	const pkg = JSON.parse(readFileSync(join(WORKTREE, "package.json"), "utf8"));
	const lock = readFileSync(join(WORKTREE, "bun.lock"), "utf8");
	const deps: Record<string, string> = {
		...pkg.dependencies,
		...pkg.devDependencies,
	};
	const now = Date.now();
	const bumps: Bump[] = [];
	const held: string[] = [];
	for (const [name, raw] of Object.entries(deps)) {
		const plan = await planOne(name, raw, lock, now);
		if (plan.bump) bumps.push(plan.bump);
		if (plan.held) held.push(plan.held);
	}
	return { bumps, held };
}

/** Write specs and re-resolve bun.lock without installing anything. */
function writeSpecsAndInstall(bumps: Bump[], spec: (b: Bump) => string) {
	const path = join(WORKTREE, "package.json");
	let text = readFileSync(path, "utf8");
	for (const b of bumps) text = setSpec(text, b.name, spec(b));
	writeFileSync(path, text);
	return sh("bun", ["install", "--lockfile-only"], WORKTREE, SCRUBBED_ENV);
}

/**
 * Pin every target exactly first so the lockfile resolves to it (a bare
 * "^7" would otherwise stay on its locked version), then restore each
 * spec's own style; the second install keeps the satisfied resolutions.
 */
function applyBumps(bumps: Bump[], table: string): string[] {
	const lockPath = join(WORKTREE, "bun.lock");
	const before = lockPackageNames(readFileSync(lockPath, "utf8"));
	for (const pass of [(b: Bump) => b.to, (b: Bump) => b.finalSpec]) {
		const r = writeSpecsAndInstall(bumps, pass);
		if (!r.ok) {
			finish(
				4,
				`Weekly package update stopped: bun install --lockfile-only failed.\n\n${table}\n\n${r.out.slice(-1500)}`,
			);
		}
	}
	const lock = readFileSync(lockPath, "utf8");
	const missed = bumps.filter((b) => lockVersion(lock, b.name) !== b.to);
	if (missed.length) {
		finish(
			4,
			`Weekly package update stopped: the lockfile did not land on ${missed.map((b) => `${b.name}@${b.to}`).join(", ")}.\n\n${table}`,
		);
	}
	// The schema URL names Biome's version. Edit it as text: running the new
	// Biome (`biome migrate`) would execute unreviewed code here.
	const biome = bumps.find((b) => b.name === "@biomejs/biome");
	const biomePath = join(WORKTREE, "biome.json");
	if (biome && existsSync(biomePath)) {
		writeFileSync(
			biomePath,
			bumpBiomeSchema(readFileSync(biomePath, "utf8"), biome.to),
		);
	}
	return [...lockPackageNames(lock)].filter((n) => !before.has(n));
}

function commitAndPush(branch: string, message: string): string {
	const changed = git(["status", "--porcelain"])
		.out.split("\n")
		.map((l) => l.slice(3).trim())
		.filter((f) => COMMIT_FILES.includes(f));
	git(["add", "--", ...changed]);
	const msgPath = join(WORKTREE, "..", "lj-website-deps-commit-msg.txt");
	writeFileSync(msgPath, message);
	const commit = git(["commit", "-q", "-F", msgPath]);
	rmSync(msgPath, { force: true });
	if (!commit.ok) throw new Error(`git commit failed: ${commit.out}`);
	const push = git(["push", "origin", `HEAD:refs/heads/${branch}`]);
	if (!push.ok) throw new Error(`git push failed: ${push.out}`);
	return git(["rev-parse", "HEAD"]).out.trim();
}

/** Poll the PR head's checks until they settle or CI_WAIT_MS runs out. */
async function waitForCi(sha: string) {
	const deadline = Date.now() + CI_WAIT_MS;
	let verdict = ciVerdict([], []);
	while (Date.now() < deadline) {
		await sleep(CI_POLL_MS);
		const runs = gh<{ check_runs: CheckRun[] }>([
			`repos/${GH_REPO}/commits/${sha}/check-runs?per_page=100`,
		]).check_runs;
		const statuses = gh<{ statuses: CommitStatus[] }>([
			`repos/${GH_REPO}/commits/${sha}/status`,
		]).statuses;
		verdict = ciVerdict(runs, statuses);
		if (verdict.state !== "pending") return verdict;
	}
	return verdict;
}

function openPr(branch: string, title: string, base: string, summary: string) {
	return gh<{ number: number; html_url: string }>([
		"-X",
		"POST",
		`repos/${GH_REPO}/pulls`,
		"-f",
		`title=${title}`,
		"-f",
		`head=${branch}`,
		"-f",
		`base=${BASE}`,
		"-f",
		`body=Weekly dependency update from the swamp \`deps-update\` workflow (scripts/deps-update.ts). Based on production ${base}. Nothing was installed or run on the ops VM; this PR merges itself when every check (CI with no secrets, Socket, the Vercel preview build) is green.\n\n\`\`\`\n${summary}\n\`\`\``,
	]);
}

/** Exit 4 unless CI settled green; the PR stays open either way. */
function requireGreen(verdict: CiVerdict, url: string, summary: string) {
	if (verdict.state === "failed") {
		finish(
			4,
			`Weekly package update stopped: CI failed on ${url} (${verdict.failed.join(", ")}). The PR is left open; nothing was merged.\n\n${summary}`,
		);
	}
	if (verdict.state === "pending") {
		finish(
			4,
			`Weekly package update stopped: CI had not finished after ${CI_WAIT_MS / 60_000} minutes on ${url} (waiting on ${verdict.waitingOn.join(", ")}). The PR is left open; merge it by hand once green.\n\n${summary}`,
		);
	}
}

function mergePr(
	pr: { number: number; html_url: string },
	sha: string,
	title: string,
	summary: string,
) {
	try {
		gh([
			"-X",
			"PUT",
			`repos/${GH_REPO}/pulls/${pr.number}/merge`,
			"-f",
			"merge_method=merge",
			"-f",
			`sha=${sha}`,
			"-f",
			`commit_title=${title} (#${pr.number})`,
		]);
	} catch (err) {
		finish(
			4,
			`Weekly package update stopped: CI was green but the merge of ${pr.html_url} was refused (main may have moved into a conflict). The PR is left open.\n\n${err instanceof Error ? err.message : String(err)}\n\n${summary}`,
		);
	}
}

/**
 * lj-website keeps dev level with production (CLAUDE.md). After the merge,
 * fast-forward dev to the new production; report rather than fail if dev
 * has drifted.
 */
function syncDev(): string {
	git(["fetch", "--quiet", "origin"], REPO);
	const pushed = git(["push", "origin", `origin/${BASE}:refs/heads/dev`], REPO);
	return pushed.ok
		? ""
		: "\n\nWARNING: production was updated but dev could not be fast-forwarded, so dev has drifted. Fix it: git push origin production:dev";
}

/** Commit, open the PR, wait for CI, merge. Never returns. */
async function ship(
	bumps: Bump[],
	base: string,
	summary: string,
): Promise<never> {
	const branch = `${BRANCH_PREFIX}${new Date().toISOString().slice(0, 10)}`;
	const n = bumps.length;
	const title = `chore(deps): weekly update, ${n} package${n === 1 ? "" : "s"}`;
	const sha = commitAndPush(
		branch,
		`${title}\n\n${summary}\n\nAutomated by the swamp deps-update workflow (scripts/deps-update.ts):\nsame-line releases at least 7 days old, lockfile resolved without\ninstalling; merged only when every GitHub check is green.\n`,
	);
	const pr = openPr(branch, title, base, summary);
	git(["worktree", "remove", "--force", WORKTREE], REPO);
	requireGreen(await waitForCi(sha), pr.html_url, summary);
	mergePr(pr, sha, title, summary);
	git(["push", "origin", "--delete", branch], REPO);
	const devNote = syncDev();
	finish(
		3,
		`Weekly package update merged: ${pr.html_url}. Every GitHub check passed (CI with no secrets, Socket, the Vercel preview build). Vercel is deploying it; prod-smoke confirms production is serving the merge within its freshness window and emails if not.\n\n${summary}${devNote}`,
	);
}

const listing = (title: string, items: string[]) =>
	items.length ? `\n\n${title}${items.join(", ")}` : "";

// ---- main -------------------------------------------------------------------

async function main() {
	const dryRun = process.argv.includes("--dry-run");
	const baseFlag = process.argv.indexOf("--base");
	const baseRef =
		dryRun && baseFlag !== -1 ? process.argv[baseFlag + 1] : `origin/${BASE}`;

	if (existsSync(join(REPO, "AGENT-SURFACE-CHANGED-ALERT.md"))) {
		finish(
			4,
			"Weekly package update did not run: AGENT-SURFACE-CHANGED-ALERT.md exists in lj-website. Review the agent-surface change first.",
		);
	}
	if (!dryRun) guardNoOpenPr();
	const base = prepareWorktree(baseRef);
	const { bumps, held } = await planBumps();
	const heldText = held.length
		? `\n\nNot applied:\n${held.map((h) => `  ${h}`).join("\n")}`
		: "";
	if (bumps.length === 0) {
		git(["worktree", "remove", "--force", WORKTREE], REPO);
		finish(0, `Nothing to update on production ${base}.${heldText}`);
	}

	const table = bumps.map((b) => `  ${b.name} ${b.from} -> ${b.to}`).join("\n");
	const added = applyBumps(bumps, table);
	const summary = `${table}${listing("New packages in the lockfile (not just new versions): ", added)}${heldText}`;

	if (dryRun) {
		git(["worktree", "remove", "--force", WORKTREE], REPO);
		finish(
			0,
			`DRY RUN on ${base}: lockfile resolved, nothing pushed. CI and the Vercel preview are the gates.\n\n${summary}`,
		);
	}
	await ship(bumps, base, summary);
}

if (import.meta.main) {
	try {
		await main();
	} catch (err) {
		console.log(
			emailSafe(
				`Weekly package update script error: ${err instanceof Error ? err.message : String(err)}`,
			),
		);
		process.exit(1);
	}
}
