// Site-wide search shared by the nav search box: records come from the
// /search-index.json endpoint (blog, customer stories, reading list, and
// Barkup Bench studies) and are filtered client-side with the same
// every-term-must-match semantics as the listing pages (searchFilter.ts).

import { matchesEveryTerm, searchTermsOf } from "$utils/searchFilter";

export type SearchRecordType =
	| "blog"
	| "customer-story"
	| "package"
	| "reading-list"
	| "study"
	| "technology";

export interface SearchRecord {
	type: SearchRecordType;
	title: string;
	blurb: string;
	tags: string[];
	url: string;
}

export const SEARCH_TYPE_LABELS: Record<SearchRecordType, string> = {
	blog: "Blog",
	study: "Research",
	"customer-story": "Customer Stories",
	package: "Packages & Tools",
	"reading-list": "Reading List",
	technology: "Technologies",
};

// every term must match somewhere in title/blurb/tags; records whose
// titles cover more terms rank first
export function filterSearchIndex(
	records: SearchRecord[],
	query: string,
	limit = 20,
): SearchRecord[] {
	const terms = searchTermsOf(query);
	if (!terms.length) return [];
	const matched = records.filter((record) =>
		matchesEveryTerm([record.title, record.blurb, ...record.tags], terms),
	);
	const titleScore = (record: SearchRecord) => {
		const title = record.title.toLowerCase();
		return terms.filter((term) => title.includes(term)).length;
	};
	return matched
		.map((record, index) => ({ record, index, score: titleScore(record) }))
		.sort((a, b) => b.score - a.score || a.index - b.index)
		.slice(0, limit)
		.map(({ record }) => record);
}

// one index fetch per page lifetime, shared by NavSearch and the
// WebMCP tools (client-side only)
let indexPromise: Promise<SearchRecord[]> | null = null;

export function loadSearchIndex(): Promise<SearchRecord[]> {
	indexPromise ??= fetch("/search-index.json")
		.then((res) => (res.ok ? res.json() : { records: [] }))
		.then((data: { records: SearchRecord[] }) => data.records ?? [])
		.catch(() => {
			indexPromise = null;
			return [];
		});
	return indexPromise;
}

// group filtered results for display, in SEARCH_TYPE_LABELS order
export function groupSearchResults(
	results: SearchRecord[],
): { type: SearchRecordType; label: string; items: SearchRecord[] }[] {
	const types = Object.keys(SEARCH_TYPE_LABELS) as SearchRecordType[];
	return types
		.map((type) => ({
			type,
			label: SEARCH_TYPE_LABELS[type],
			items: results.filter((record) => record.type === type),
		}))
		.filter((group) => group.items.length > 0);
}
