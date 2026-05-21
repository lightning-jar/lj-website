// Atom feed builder shared by /atom.xml, /blog/atom.xml, /reading-list/atom.xml.

export type FeedEntry = {
	id: string;
	title: string;
	link: string;
	updated: string;
	summary: string;
	authorName: string;
	category: string;
};

export type FeedOptions = {
	baseUrl: string;
	feedSelf: string;
	feedTitle: string;
};

export function escapeXML(s: string): string {
	return s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

export function toIso(date: string | undefined): string {
	if (!date) return new Date().toISOString();
	// Stored dates are YYYY-MM-DD; pin to noon UTC for stable, unambiguous output.
	const d = new Date(date.length === 10 ? `${date}T12:00:00Z` : date);
	return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

export function str(value: unknown): string {
	return typeof value === "string" ? value : "";
}

function renderEntry(e: FeedEntry): string {
	return `  <entry>
    <id>${escapeXML(e.id)}</id>
    <title>${escapeXML(e.title)}</title>
    <link rel="alternate" type="text/html" href="${escapeXML(e.link)}"/>
    <updated>${e.updated}</updated>
    <author><name>${escapeXML(e.authorName)}</name></author>
    <category term="${escapeXML(e.category)}"/>
    <summary type="text">${escapeXML(e.summary)}</summary>
  </entry>`;
}

export function buildAtomFeed(
	entries: FeedEntry[],
	opts: FeedOptions,
): string {
	const sorted = [...entries].sort((a, b) => b.updated.localeCompare(a.updated));
	const updated = sorted[0]?.updated ?? new Date().toISOString();

	return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>${opts.feedSelf}</id>
  <title>${escapeXML(opts.feedTitle)}</title>
  <link rel="self" type="application/atom+xml" href="${opts.feedSelf}"/>
  <link rel="alternate" type="text/html" href="${opts.baseUrl}/"/>
  <updated>${updated}</updated>
  <author><name>Lightning Jar</name></author>
${sorted.map(renderEntry).join("\n")}
</feed>`;
}
