import { describe, expect, it } from "vitest";

// Technology pages list related reading in a sidebar widget. The field is a
// list (`relatedReading`); the old single `relatedArticle` is no longer read,
// so a file that still uses it would silently lose its link.
const files = import.meta.glob<{ default: Record<string, unknown> }>(
	"../src/lib/content/technologies/*.json",
	{ eager: true },
);

const entries = Object.entries(files).map(([path, mod]) => ({
	path: path.split("/").pop() ?? path,
	tech: mod.default,
}));

const supercategoryFiles = import.meta.glob<{
	default: Record<string, unknown>;
}>("../src/lib/content/technologySuperCategories/*.json", { eager: true });

const supercategories = Object.entries(supercategoryFiles).map(
	([path, mod]) => ({
		path: path.split("/").pop() ?? path,
		sc: mod.default,
	}),
);
const supercategoryIds = new Set(supercategories.map((s) => s.sc.id));

describe("technology supercategories", () => {
	// A misspelled key (once "shoreName") is silently ignored, and the
	// detail page's sidebar falls back to "More Related Technologies".
	it.each(supercategories)(
		"$path has id, name and shortName",
		({ path, sc }) => {
			expect(`${sc.id}.json`).toBe(path);
			for (const key of ["id", "name", "shortName", "description"]) {
				expect(typeof sc[key]).toBe("string");
				expect((sc[key] as string).trim()).not.toBe("");
			}
		},
	);

	it.each(entries)("$path names a supercategory that exists", ({ tech }) => {
		expect(supercategoryIds).toContain(tech.supercategory);
	});
});

describe("technology content", () => {
	it("loads the technology files", () => {
		expect(entries.length).toBeGreaterThan(0);
	});

	it.each(entries)(
		"$path uses relatedReading, not relatedArticle",
		({ tech }) => {
			expect(tech).not.toHaveProperty("relatedArticle");
		},
	);

	it.each(entries.filter((e) => e.tech.relatedReading !== undefined))(
		"$path has well-formed, unique related reading",
		({ tech }) => {
			const items = tech.relatedReading as { href: unknown; title: unknown }[];
			expect(Array.isArray(items)).toBe(true);
			expect(items.length).toBeGreaterThan(0);
			for (const item of items) {
				expect(typeof item.title).toBe("string");
				expect((item.title as string).trim()).not.toBe("");
				expect(typeof item.href).toBe("string");
				expect(item.href as string).toMatch(/^(\/[a-z0-9]|https:\/\/)/);
			}
			const hrefs = items.map((i) => i.href);
			expect(new Set(hrefs).size).toBe(hrefs.length);
		},
	);
});
