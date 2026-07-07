import { error } from "@sveltejs/kit";

// Catch-all for unmatched paths. The site is fully prerendered, so without
// this route the Vercel fallback function has an empty route manifest and
// SvelteKit's resolve() throws "Not found: <path>" as an unhandled error
// (FUNCTION_INVOCATION_FAILED, a 500) instead of rendering the error page.
// Must NOT be prerendered: it has to stay in the server manifest to catch
// runtime misses.
export const prerender = false;

export function load() {
	error(404, "Page not found");
}
