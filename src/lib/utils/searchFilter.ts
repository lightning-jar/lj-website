// Shared logic for listing-page search: the search box is the single source
// of truth, split into terms, and tag chips are just shortcuts that add or
// remove their term. Used by /blog and /customer-stories.

export function searchTermsOf(search: string): string[] {
	return search.toLowerCase().split(/\s+/).filter(Boolean);
}

export function matchesEveryTerm(
	haystackParts: string[],
	terms: string[],
): boolean {
	const haystack = haystackParts.join(" ").toLowerCase();
	return terms.every((term) => haystack.includes(term));
}

// unique tags across all items, alphabetized
export function uniqueSortedTags(tagLists: (string[] | undefined)[]): string[] {
	return [...new Set(tagLists.flatMap((tags) => tags ?? []))].sort((a, b) =>
		a.localeCompare(b),
	);
}

// a tag counts as active when every one of its words is a search term
// (tags can be multi-word, e.g. "Machine Learning", while terms are
// whitespace-split)
export function tagIsActive(searchTerms: string[], tag: string): boolean {
	const words = searchTermsOf(tag);
	return words.length > 0 && words.every((w) => searchTerms.includes(w));
}

// add the tag's words to the search string, or remove them all if the
// tag is already active; single-word tags behave as before
export function toggleSearchTerm(search: string, tag: string): string {
	const words = searchTermsOf(tag);
	const terms = searchTermsOf(search);
	return tagIsActive(terms, tag)
		? terms.filter((t) => !words.includes(t)).join(" ")
		: [...terms, ...words.filter((w) => !terms.includes(w))].join(" ");
}
