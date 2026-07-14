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

// add the tag's term to the search string, or remove it if already present
export function toggleSearchTerm(search: string, tag: string): string {
	const term = tag.toLowerCase();
	const terms = searchTermsOf(search);
	return terms.includes(term)
		? terms.filter((t) => t !== term).join(" ")
		: [...terms, term].join(" ");
}
