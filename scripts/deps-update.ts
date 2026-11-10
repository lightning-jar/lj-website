// scripts/deps-update.ts
//
// Weekly dependency update (the swamp `deps-update` workflow). Kevin chose
// "straight to production" on 2026-11-10: when every gate passes, the
// update is committed and pushed to production and dev with no review.
// Because nothing reviews it, the rules for WHAT moves are strict:
//
// - Only exact pins ("1.2.3") and caret ranges ("^1.2.3") are touched.
// - Only same-line releases: same major, and for 0.x the same minor too
//   (semver treats 0.x minors as breaking). Majors are reported, never
//   applied.
// - Cooldown: a version must have been on npm for 7 days. bunfig.toml sets
//   the same rule for ranges and transitive deps, but Bun lets an exact pin
//   bypass it, so pins are checked here.
// - No prereleases, no deprecated versions.
//
// It never touches the shared checkout (other sessions work in it): the
// update runs in its own worktree at origin/production. Gates: svelte-check,
// Vitest (includes the supply-chain lockfile watchlist), Biome, a full
// build. A failed gate leaves the worktree for inspection and pushes
// nothing. The prod-smoke workflow (every 30 min) then confirms production
// is serving the pushed sha and emails if not.
//
// Exit codes (the workflow branches on these): 0 = nothing to update,
// 3 = updated and pushed, 4 = stopped on purpose (gate failed, push
// conflict, agent-surface alert), 1 = the script itself broke.
// stdout is the email body; everything else goes to stderr.
//
// Usage: bun scripts/deps-update.ts [--dry-run [--base <ref>]]
// --base (dry runs only) starts from another ref, to exercise the gates.

import { spawnSync } from "node:child_process";
import {
	copyFileSync,
	existsSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";

const HOME = process.env.HOME ?? "/home/exedev";
const REPO = join(import.meta.dirname, "..");
const WORKTREE = join(HOME, "projects/.worktrees/lj-website-deps");
export const MIN_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export interface Spec {
	prefix: "" | "^";
	version: string;
}

/** "1.2.3" or "^1.2.3"; anything else (tags, ~, ranges, prereleases) is left alone. */
export function parseSpec(spec: string): Spec | null {
	const m = /^(\^?)(\d+\.\d+\.\d+)$/.exec(spec);
	return m ? { prefix: m[1] as Spec["prefix"], version: m[2] } : null;
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
	/** Newest stable version overall, when it is beyond what we may apply. */
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
	const old = (v: string) => {
		const t = Date.parse(doc.time[v] ?? "");
		return Number.isFinite(t) && now - t >= minAgeMs;
	};
	const target = newer.find((v) => sameLine(current, v) && old(v)) ?? null;
	const newest = newer[0];
	let held: Decision["held"] = null;
	if (newest && newest !== target) {
		held = {
			version: newest,
			reason: !sameLine(current, newest)
				? "breaking per semver"
				: "under 7 days old",
		};
	}
	return { target, held };
}

/**
 * Swap one dependency's spec in package.json text, keeping its layout.
 * Only the `dependencies` and `devDependencies` objects are searched: an
 * npm script can share a package's name (slx-web has `"storybook":
 * "storybook dev -p 6006"` above its `storybook` devDependency), and a
 * whole-file match would overwrite the script with a version. Found by
 * slx-web's port of this script, 2026-11-10.
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

/** Package names in a bun.lock (from each "packages" entry's "name@version"). */
export function lockPackageNames(lockText: string): Set<string> {
	const names = new Set<string>();
	const start = lockText.indexOf('"packages"');
	if (start === -1) return names;
	for (const m of lockText
		.slice(start)
		.matchAll(/^\s+"[^"]+": \["((?:@[^/"]+\/)?[^@"]+)@/gm)) {
		names.add(m[1]);
	}
	return names;
}

/**
 * The email travels as a --body="…" flag: a double quote would split it.
 * Terminal color codes from gate output are noise in an email.
 */
export function emailSafe(text: string): string {
	// biome-ignore lint/suspicious/noControlCharactersInRegex: matching the ESC that starts an ANSI color code is the point
	return text.replace(/\x1b\[[0-9;]*m/g, "").replace(/"/g, "'");
}

// ---- main -----------------------------------------------------------------

function sh(
	cmd: string,
	args: string[],
	cwd: string,
	timeoutMs = 600_000,
): { ok: boolean; out: string } {
	const r = spawnSync(cmd, args, {
		cwd,
		encoding: "utf8",
		maxBuffer: 64 * 1024 * 1024,
		timeout: timeoutMs,
	});
	const out = `${r.stdout ?? ""}${r.stderr ?? ""}`;
	process.stderr.write(`$ ${cmd} ${args.join(" ")} -> ${r.status}\n`);
	return { ok: r.status === 0, out };
}

function git(args: string[], cwd = REPO) {
	return sh("git", args, cwd, 120_000);
}

function finish(code: number, body: string): never {
	console.log(emailSafe(body));
	process.exit(code);
}

async function fetchDoc(name: string): Promise<RegistryDoc> {
	const url = `https://registry.npmjs.org/${name.replace("/", "%2f")}`;
	const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
	if (!res.ok) throw new Error(`registry ${res.status} for ${name}`);
	return (await res.json()) as RegistryDoc;
}

async function main() {
	const dryRun = process.argv.includes("--dry-run");
	const baseFlag = process.argv.indexOf("--base");
	const baseRef =
		dryRun && baseFlag !== -1
			? process.argv[baseFlag + 1]
			: "origin/production";

	if (existsSync(join(REPO, "AGENT-SURFACE-CHANGED-ALERT.md"))) {
		finish(
			4,
			"Weekly package update did not run: AGENT-SURFACE-CHANGED-ALERT.md exists in lj-website. Review the agent-surface change first.",
		);
	}

	if (!git(["fetch", "--quiet", "origin"]).ok) {
		throw new Error("git fetch failed");
	}
	if (existsSync(WORKTREE)) {
		git(["worktree", "remove", "--force", WORKTREE]);
		rmSync(WORKTREE, { recursive: true, force: true });
		git(["worktree", "prune"]);
	}
	if (!git(["worktree", "add", "--detach", WORKTREE, baseRef]).ok) {
		throw new Error("git worktree add failed");
	}
	// varlock needs the 1Password environment pointers (OP_ENV_ID,
	// OP_TOKEN) that live only in the gitignored .env.local.
	if (existsSync(join(REPO, ".env.local"))) {
		copyFileSync(join(REPO, ".env.local"), join(WORKTREE, ".env.local"));
	}
	const base = git(["rev-parse", "--short", "HEAD"], WORKTREE).out.trim();

	const pkgPath = join(WORKTREE, "package.json");
	let pkgText = readFileSync(pkgPath, "utf8");
	const pkg = JSON.parse(pkgText) as {
		dependencies?: Record<string, string>;
		devDependencies?: Record<string, string>;
	};
	const deps = { ...pkg.dependencies, ...pkg.devDependencies };

	const now = Date.now();
	const bumps: { name: string; from: string; to: string }[] = [];
	const held: string[] = [];
	for (const [name, raw] of Object.entries(deps)) {
		const spec = parseSpec(raw);
		if (!spec) continue;
		const d = decide(spec.version, await fetchDoc(name), now);
		if (d.target) {
			bumps.push({ name, from: spec.version, to: d.target });
			pkgText = setSpec(pkgText, name, `${spec.prefix}${d.target}`);
		}
		if (d.held) held.push(`${name} ${d.held.version} (${d.held.reason})`);
	}
	const heldText = held.length
		? `\n\nNot applied:\n${held.map((h) => `  ${h}`).join("\n")}`
		: "";

	if (bumps.length === 0) {
		git(["worktree", "remove", "--force", WORKTREE]);
		finish(0, `Nothing to update on production ${base}.${heldText}`);
	}

	const table = bumps.map((b) => `  ${b.name} ${b.from} -> ${b.to}`).join("\n");
	writeFileSync(pkgPath, pkgText);

	const lockBefore = lockPackageNames(
		readFileSync(join(WORKTREE, "bun.lock"), "utf8"),
	);
	const install = sh("bun", ["install"], WORKTREE);
	if (!install.ok) {
		finish(
			4,
			`Weekly package update stopped: bun install failed.\n\n${table}\n\n${install.out.slice(-1500)}`,
		);
	}
	const added = [
		...lockPackageNames(readFileSync(join(WORKTREE, "bun.lock"), "utf8")),
	].filter((n) => !lockBefore.has(n));
	if (bumps.some((b) => b.name === "@biomejs/biome")) {
		sh("bunx", ["biome", "migrate", "--write"], WORKTREE);
	}

	const gates: [string, string, string[]][] = [
		["type check", "bun", ["run", "check"]],
		["tests", "bun", ["run", "test"]],
		["biome", "bunx", ["biome", "check", "."]],
		["build", "bun", ["run", "build"]],
	];
	for (const [label, cmd, args] of gates) {
		const r = sh(cmd, args, WORKTREE, 900_000);
		if (!r.ok) {
			finish(
				4,
				`Weekly package update stopped: the ${label} gate failed, so nothing was pushed. The worktree is left at ${WORKTREE} for inspection.\n\nAttempted:\n${table}\n\nLast output:\n${r.out.slice(-2000)}`,
			);
		}
	}

	const addedText = added.length
		? `\n\nNew packages in the lockfile (not just new versions): ${added.join(", ")}`
		: "";

	if (dryRun) {
		git(["worktree", "remove", "--force", WORKTREE]);
		finish(
			0,
			`DRY RUN, all gates passed on ${base}; nothing committed.\n\n${table}${addedText}${heldText}`,
		);
	}

	const files = ["package.json", "bun.lock"];
	if (git(["diff", "--quiet", "--", "biome.json"], WORKTREE).ok === false) {
		files.push("biome.json");
	}
	git(["add", "--", ...files], WORKTREE);
	const message = `chore(deps): weekly update, ${bumps.length} package${bumps.length === 1 ? "" : "s"}\n\n${table}${addedText}${heldText}\n\nAutomated by the swamp deps-update workflow (scripts/deps-update.ts):\nsame-line releases at least 7 days old; check, tests, Biome and build\npassed before push.\n`;
	const msgPath = join(WORKTREE, "..", "lj-website-deps-commit-msg.txt");
	writeFileSync(msgPath, message);
	const commit = git(["commit", "-q", "-F", msgPath], WORKTREE);
	rmSync(msgPath, { force: true });
	if (!commit.ok) throw new Error(`git commit failed: ${commit.out}`);

	// Push. Other sessions push to production often; if it moved, rebase
	// once, re-run the fast gates on the new base, and try again.
	let pushed = git(["push", "origin", "HEAD:production"], WORKTREE);
	if (!pushed.ok) {
		git(["fetch", "--quiet", "origin"], WORKTREE);
		if (!git(["rebase", "origin/production"], WORKTREE).ok) {
			git(["rebase", "--abort"], WORKTREE);
			finish(
				4,
				`Weekly package update stopped: production moved and the update no longer rebases cleanly (someone else changed package.json or bun.lock). Nothing was pushed.\n\n${table}`,
			);
		}
		for (const [label, cmd, args] of gates.slice(0, 2)) {
			const r = sh(cmd, args, WORKTREE, 900_000);
			if (!r.ok) {
				finish(
					4,
					`Weekly package update stopped: after rebasing onto the new production, the ${label} gate failed. Nothing was pushed.\n\n${table}\n\n${r.out.slice(-2000)}`,
				);
			}
		}
		pushed = git(["push", "origin", "HEAD:production"], WORKTREE);
		if (!pushed.ok) {
			finish(
				4,
				`Weekly package update stopped: push to production was rejected twice. Nothing was pushed.\n\n${table}`,
			);
		}
	}
	const sha = git(["rev-parse", "--short", "HEAD"], WORKTREE).out.trim();
	const dev = git(["push", "origin", "HEAD:dev"], WORKTREE);
	const devNote = dev.ok
		? ""
		: "\n\nWARNING: production was pushed but the dev push failed, so dev has drifted. Fast-forward it: git push origin production:dev";
	git(["worktree", "remove", "--force", WORKTREE]);
	finish(
		3,
		`Weekly package update shipped ${sha} to production (base ${base}). Check, tests, Biome and build passed. Vercel is deploying it; prod-smoke confirms production is serving ${sha} within 30 minutes and emails if not.\n\n${table}${addedText}${heldText}${devNote}`,
	);
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
