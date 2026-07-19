/**
 * Scheme allowlist for URLs that come from article frontmatter
 * (additionalReading, sources, image) and are bound directly to
 * href/src attributes. The markdown BODY is sanitized by
 * parseMarkdown (unsafe javascript:/vbscript:/data: schemes are
 * neutralized there), but frontmatter-driven attributes bypass that
 * parser — this applies the same policy at the binding site.
 *
 * Returns the URL when it is http(s) or root-relative, else "".
 */
export function safeLinkUrl(url: unknown): string {
	if (typeof url !== "string") return "";
	const trimmed = url.trim();
	if (/^https?:\/\//i.test(trimmed)) return trimmed;
	if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return trimmed;
	return "";
}
