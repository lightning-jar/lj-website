// A Findings-series entry: one verified platform lesson with a receipt.
// Entries live in the replicator CMS (Lightning Jar org, collection
// "findings", Findings blog entity). The claim is the title; the prose
// (symptom, cause, fix, receipt) rides in the markdown body.
export interface Finding {
	/** The claim, stated in one sentence. */
	title?: string;
	metaTitle?: string;
	slug?: string;
	/** One-line summary for cards, search, and meta description. */
	description?: string;
	/** Sequence number in the series ("Findings No. N"). */
	number?: number;
	/** Platform area: Web Audio, Browser Platform, Testing, Tooling, … */
	area?: string;
	/** Project the finding was earned in: Stem Shovel, Replicator, … */
	project?: string;
	/** Date the finding was last verified (YYYY-MM-DD). */
	verified?: string;
	/** Environment the receipt applies to, e.g. "Safari 26 on iOS 26". */
	environment?: string;
	tags?: string[];
}

export interface FindingDetail {
	frontMatter: Finding;
	/** Locally parsed, sanitized HTML of the markdown body. */
	html: string;
}
