import { describe, expect, test } from "bun:test";
import {
	authorNameKey,
	matchAuthorProfile,
} from "../src/lib/utils/authorMatch";

const CATALOG = [
	{
		name: "Kevin Peckham",
		title: "Principal",
		organization: "Lightning Jar",
		imageUrl: "https://example.com/kevin.webp",
	},
	{ name: "Jane Doe", title: "", organization: "", imageUrl: null },
];

describe("authorNameKey", () => {
	test("normalizes case, whitespace, and punctuation", () => {
		expect(authorNameKey("Kevin  Peckham")).toBe("kevin peckham");
		expect(authorNameKey("kevin-peckham")).toBe("kevin peckham");
		expect(authorNameKey(null)).toBe("");
	});
});

describe("matchAuthorProfile", () => {
	test("matches a bare name exactly", () => {
		expect(matchAuthorProfile(CATALOG, "Kevin Peckham")?.title).toBe(
			"Principal",
		);
	});

	test("matches the canonical byline string by its name part", () => {
		expect(
			matchAuthorProfile(CATALOG, "Kevin Peckham | Principal, Lightning Jar")
				?.name,
		).toBe("Kevin Peckham");
	});

	test("tolerates case and spacing drift", () => {
		expect(matchAuthorProfile(CATALOG, "kevin  peckham")?.name).toBe(
			"Kevin Peckham",
		);
	});

	test("returns null for unknown or empty authors", () => {
		expect(matchAuthorProfile(CATALOG, "Someone Else")).toBeNull();
		expect(matchAuthorProfile(CATALOG, "")).toBeNull();
		expect(matchAuthorProfile(CATALOG, null)).toBeNull();
	});
});
