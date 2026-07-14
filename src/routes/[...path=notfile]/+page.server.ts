import { error } from "@sveltejs/kit";

// Catch-all for unmatched paths. The site is fully prerendered, so without
// this route the Vercel fallback function has an empty route manifest and
// SvelteKit's resolve() throws "Not found: <path>" as an unhandled error
// (FUNCTION_INVOCATION_FAILED, a 500) instead of rendering the error page.
// Must NOT be prerendered: it has to stay in the server manifest to catch
// runtime misses.
// The `notfile` matcher keeps file-like URLs (sitemap.xml, atom.xml, ...) out
// of this route so client-side navigation to prerendered endpoints falls back
// to a full-page request instead of a client-rendered 404.
export const prerender = false;

export function load() {
	error(404, "Page not found");
}
