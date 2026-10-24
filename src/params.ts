import { defineParams } from "@sveltejs/kit/params";

// SvelteKit 3 declares every param matcher here instead of in separate
// src/params/*.ts files. A matcher returns the parsed param when it
// matches, or undefined when it does not.
export const params = defineParams({
	// Kebab-case content slugs only. Rejecting file-like params (e.g.
	// "atom.xml") keeps endpoint URLs out of the client router, which then
	// falls back to a full-page request that the prerendered endpoint can
	// answer.
	slug: (param) =>
		/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(param) ? param : undefined,

	// The 404 catch-all should not swallow file-like URLs (sitemap.xml,
	// atom.xml, robots.txt, ...). When it declines them, the client router
	// has no matching route and falls back to a full-page request, which
	// the prerendered endpoint or static asset can answer.
	notfile: (param) => {
		const lastSegment = param.split("/").pop() ?? "";
		return lastSegment.includes(".") ? undefined : param;
	},
});
