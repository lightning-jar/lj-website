import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "bun:test";
import { parseMarkdown } from "../src/lib/utils/parseMarkdown";

// Characterization test for parseMarkdown against a FROZEN snapshot of
// the blog corpus (the 48 posts as of the 2026-07 CMS migration, kept
// under tests/fixtures/blog-corpus/). Live content moved to the
// replicator CMS — this corpus no longer tracks it; it exists purely so
// any parser change that alters rendered HTML fails here, intended or
// not. Do not add new posts here.
//
// To regenerate after an INTENDED parser change:
//   UPDATE_GOLDEN=1 bun test tests/blogCorpus.test.ts
// then review the fixture diff before committing.

const blogDir = join(import.meta.dir, "fixtures/blog-corpus");
const fixturePath = join(import.meta.dir, "fixtures/blog-corpus-hashes.json");

function renderAll(): Record<string, string> {
	const hashes: Record<string, string> = {};
	const files = readdirSync(blogDir)
		.filter((f) => f.endsWith(".md"))
		.sort();
	for (const file of files) {
		const { html } = parseMarkdown(readFileSync(join(blogDir, file), "utf8"));
		hashes[file] = new Bun.CryptoHasher("sha256").update(html).digest("hex");
	}
	return hashes;
}

describe("blog corpus golden render", () => {
	const actual = renderAll();

	if (process.env.UPDATE_GOLDEN) {
		it("regenerates the fixture", () => {
			writeFileSync(fixturePath, `${JSON.stringify(actual, null, "\t")}\n`);
			expect(Object.keys(actual).length).toBeGreaterThan(0);
		});
		return;
	}

	const golden: Record<string, string> = JSON.parse(
		readFileSync(fixturePath, "utf8"),
	);

	it("covers the same set of posts as the fixture", () => {
		const newPosts = Object.keys(actual).filter((f) => !(f in golden));
		const removedPosts = Object.keys(golden).filter((f) => !(f in actual));
		// New posts are expected as content ships; regenerate the fixture when
		// they appear. Removed posts should be deliberate.
		if (newPosts.length || removedPosts.length) {
			console.warn("corpus drift — regenerate fixture:", {
				newPosts,
				removedPosts,
			});
		}
		expect(removedPosts).toEqual([]);
	});

	it("renders every known post byte-identically to the fixture", () => {
		const changed = Object.keys(golden).filter(
			(f) => f in actual && actual[f] !== golden[f],
		);
		expect(changed).toEqual([]);
	});
});
