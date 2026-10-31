// Format an article's calendar date (frontmatter "2026-10-31") for display.
//
// `new Date("2026-10-31")` is midnight UTC, so formatting it in the reader's
// (or server's) timezone shows the previous day anywhere west of UTC: an
// article dated Oct 31 read as 10/30/2026 in the US. Formatting in UTC
// keeps the calendar date the author chose, and pinning the locale makes
// the server render and the hydrated client agree.
export function formatCalendarDate(value: unknown): string {
	if (typeof value !== "string" || !value) return "";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	return date.toLocaleDateString("en-US", { timeZone: "UTC" });
}
