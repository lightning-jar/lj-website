import { describe, expect, it } from "vitest";
import { formatCalendarDate } from "../src/lib/utils/formatCalendarDate";

describe("formatCalendarDate", () => {
	it("keeps the author's calendar date (no off-by-one west of UTC)", () => {
		expect(formatCalendarDate("2026-10-31")).toBe("10/31/2026");
		expect(formatCalendarDate("2026-01-01")).toBe("1/1/2026");
	});

	it("documents the bug it replaces: local-time formatting slips a day", () => {
		// What the blog did before: format a midnight-UTC date in a US zone.
		expect(
			new Date("2026-10-31").toLocaleDateString("en-US", {
				timeZone: "America/Chicago",
			}),
		).toBe("10/30/2026");
	});

	it("returns an empty string for missing or invalid input", () => {
		expect(formatCalendarDate(undefined)).toBe("");
		expect(formatCalendarDate("")).toBe("");
		expect(formatCalendarDate("not a date")).toBe("");
		expect(formatCalendarDate(20261031)).toBe("");
	});
});
