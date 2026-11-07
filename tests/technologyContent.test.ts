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
