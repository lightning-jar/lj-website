// Author-profile matching for the article attribution section: the
// CMS frontmatter carries an author STRING (bare name or the canonical
// "Name | Title, Org" byline), matched against the CMS author catalog
// tolerantly — case, whitespace, and punctuation differences don't
// break attribution.

export interface AuthorProfileRef {
	name: string;
	title: string;
	organization: string;
	imageUrl: string | null;
}

/** Case/whitespace/punctuation-insensitive name identity key. Mirrors
 * the CMS's `blogAuthorNameKey`. */
export function authorNameKey(name: string | null | undefined): string {
	return (name ?? "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, " ")
		.trim();
}

/** Resolve an author string to a catalog profile, or null. */
export function matchAuthorProfile<T extends AuthorProfileRef>(
	catalog: T[],
	author: string | null | undefined,
): T | null {
	const key = authorNameKey((author ?? "").split("|")[0]);
	if (!key) return null;
	return catalog.find((a) => authorNameKey(a.name) === key) ?? null;
}
