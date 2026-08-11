import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Supply-chain tripwires, added after the 2026-08 keyv/cacheable npm
// compromise (see /reading-list/keyv-cacheable-compromise). Two
// guards, both deterministic and offline:
//
// 1. A watchlist of package namespaces from known supply-chain
//    incidents. None are dependencies of this repo today, so ANY
//    appearance in the lockfile means a new dependency pulled one in —
//    investigate the version against the incident advisories before
//    accepting. Extend the list as incidents occur; add version
//    qualifiers if we ever legitimately depend on one.
// 2. Bun only runs install scripts for packages in trustedDependencies
//    — that default-off posture is this repo's main structural defense
//    against install-hook malware. Pinning the allowlist here makes
//    growing it a conscious, reviewed decision instead of a drive-by.

const repoRoot = join(import.meta.dir, "..");

// package-name prefixes as they appear in bun.lock keys ("name@version")
const WATCHLIST: { pattern: string; incident: string }[] = [
	{ pattern: '"keyv@', incident: "2026-08 keyv/cacheable compromise" },
	{ pattern: '"@keyv/', incident: "2026-08 keyv/cacheable compromise" },
	{ pattern: '"cacheable@', incident: "2026-08 keyv/cacheable compromise" },
	{ pattern: '"@cacheable/', incident: "2026-08 keyv/cacheable compromise" },
	{ pattern: '"flat-cache@', incident: "2026-08 keyv/cacheable compromise" },
	{
		pattern: '"file-entry-cache@',
		incident: "2026-08 keyv/cacheable compromise",
	},
];

describe("supply-chain tripwires", () => {
	test("lockfile is free of watchlisted packages", () => {
		const lock = readFileSync(join(repoRoot, "bun.lock"), "utf8");
		const hits = WATCHLIST.filter((w) => lock.includes(w.pattern));
		expect(hits.map((h) => `${h.pattern} (${h.incident})`)).toEqual([]);
	});

	test("install-script allowlist grows only deliberately", () => {
		const pkg = JSON.parse(
			readFileSync(join(repoRoot, "package.json"), "utf8"),
		) as { trustedDependencies?: string[] };
		// updating this list is fine — do it HERE, consciously, alongside
		// the package.json change, having considered what scripts the new
		// entry runs at install time
		expect(pkg.trustedDependencies ?? []).toEqual(["@biomejs/biome"]);
	});
});
