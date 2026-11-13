import type { LjPackage } from "#lib/types/Package.js";

import { describe, expect, it } from "vitest";

// Package pages are git content (src/lib/content/packages/*.json). A family
// page (barmark and its @barmark/* packages) lists its members in groups;
// a typo there is a dead npm link or a duplicated row that nothing else
// would catch.
const files = import.meta.glob<{ default: LjPackage }>(
	"../src/lib/content/packages/*.json",
	{ eager: true },
);

const entries = Object.entries(files).map(([path, mod]) => ({
	path: path.split("/").pop() ?? path,
	pkg: mod.default,
}));

const NPM_NAME = /^(@[a-z0-9-]+\/)?[a-z0-9][a-z0-9._-]*$/;

describe("package content", () => {
	it("loads the package files", () => {
		expect(entries.length).toBeGreaterThan(0);
	});

	it.each(entries)("$path: id matches the file name", ({ path, pkg }) => {
		expect(`${pkg.id}.json`).toBe(path);
	});

	it.each(entries.filter((e) => e.pkg.members !== undefined))(
		"$path: family members are well formed and listed once",
		({ pkg }) => {
			const groups = pkg.members ?? [];
			expect(groups.length).toBeGreaterThan(0);
			const names: string[] = [];
			for (const group of groups) {
				expect(group.label.trim()).not.toBe("");
				expect(group.packages.length).toBeGreaterThan(0);
				for (const member of group.packages) {
					expect(member.npmName).toMatch(NPM_NAME);
					expect(member.summary.trim().length).toBeGreaterThan(20);
					names.push(member.npmName);
				}
			}
			expect(new Set(names).size).toBe(names.length);
			// the family's own package is one of its members
			if (pkg.npmName) expect(names).toContain(pkg.npmName);
		},
	);

	it("barmark lists the published @barmark packages", () => {
		const barmark = entries.find((e) => e.pkg.id === "barmark")?.pkg;
		const names = (barmark?.members ?? []).flatMap((g) =>
			g.packages.map((p) => p.npmName),
		);
		for (const name of [
			"barmark",
			"@barmark/render",
			"@barmark/score",
			"@barmark/musicxml",
			"@barmark/midi",
			"@barmark/sync",
			"@barmark/cli",
			"@barmark/engraver",
		]) {
			expect(names).toContain(name);
		}
	});
});
