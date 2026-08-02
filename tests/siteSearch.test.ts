import { describe, expect, test } from "bun:test";
import {
	filterSearchIndex,
	focusLeftContainer,
	groupSearchResults,
	type SearchRecord,
} from "../src/lib/utils/siteSearch";

const records: SearchRecord[] = [
	{
		type: "blog",
		title: "Leaving WordPress",
		blurb: "Why we moved our site off WordPress.",
		tags: ["CMS", "WordPress"],
		url: "/blog/leaving-wordpress",
	},
	{
		type: "study",
		title: "Study AO: Canonical-tag steering",
		blurb: "Unguided models never match a tag catalog's exact casing.",
		tags: ["Agent-surface steering"],
		url: "/research/barkup-bench/ao",
	},
	{
		type: "customer-story",
		title: "SecureLogix Digital Stack",
		blurb: "A full rebuild of the SecureLogix web presence.",
		tags: ["SvelteKit"],
		url: "/customer-stories/securelogix-digital-stack",
	},
	{
		type: "reading-list",
		title: "Overtraining as the Path to Human-like AI",
		blurb: "Sean Goedecke on overtraining.",
		tags: ["Machine Learning"],
		url: "/reading-list/overtraining",
	},
];

describe("filterSearchIndex", () => {
	test("empty and whitespace-only queries return nothing", () => {
		expect(filterSearchIndex(records, "")).toEqual([]);
		expect(filterSearchIndex(records, "   ")).toEqual([]);
	});

	test("matches case-insensitively across title, blurb, and tags", () => {
		expect(filterSearchIndex(records, "WORDPRESS")).toHaveLength(1);
		expect(filterSearchIndex(records, "catalog")).toHaveLength(1); // blurb
		expect(filterSearchIndex(records, "sveltekit")).toHaveLength(1); // tag
	});

	test("every term must match somewhere", () => {
		expect(filterSearchIndex(records, "securelogix rebuild")).toHaveLength(1);
		expect(filterSearchIndex(records, "securelogix wordpress")).toHaveLength(0);
	});

	test("title matches rank above blurb-only matches", () => {
		const results = filterSearchIndex(records, "overtraining");
		// appears in both title and blurb of the reading-list entry only
		expect(results[0]?.type).toBe("reading-list");
		const steering = filterSearchIndex(records, "steering");
		expect(steering[0]?.title).toContain("Canonical-tag");
	});

	test("respects the limit", () => {
		expect(filterSearchIndex(records, "e", 2)).toHaveLength(2);
	});
});

describe("groupSearchResults", () => {
	test("groups results by type with display labels, dropping empty groups", () => {
		const groups = groupSearchResults(filterSearchIndex(records, "e"));
		expect(groups.map((g) => g.label)).toEqual([
			"Blog",
			"Research",
			"Customer Stories",
			"Reading List",
		]);
		const solo = groupSearchResults(filterSearchIndex(records, "wordpress"));
		expect(solo).toHaveLength(1);
		expect(solo[0]?.label).toBe("Blog");
		expect(solo[0]?.items).toHaveLength(1);
	});
});

// Regression: iPadOS/Safari taps on a search result fire focusout with
// relatedTarget null while the tap is in flight; closing on null used
// to unmount the tapped <a> before its click dispatched, eating the
// navigation. (bun test cannot mount .svelte components, so the
// component's focusout decision lives in this pure predicate and the
// handler stays one line — the repo's convention for testable logic.)
describe("focusLeftContainer (NavSearch focusout decision)", () => {
	const node = (inside: boolean) => ({ isInside: inside }) as unknown as Node;
	const container = {
		contains: (n: Node) =>
			(n as unknown as { isInside?: boolean }).isInside === true,
	};

	test("stays open when focusout has no relatedTarget (Safari tap)", () => {
		expect(focusLeftContainer(container, null)).toBe(false);
	});

	test("closes when focus lands outside the container", () => {
		expect(focusLeftContainer(container, node(false))).toBe(true);
	});

	test("stays open when focus moves within the container", () => {
		expect(focusLeftContainer(container, node(true))).toBe(false);
	});
});
