import type { ParamMatcher } from "@sveltejs/kit";

// The 404 catch-all should not swallow file-like URLs (sitemap.xml, atom.xml,
// robots.txt, ...). When it declines them, the client router has no matching
// route and falls back to a full-page request, which the prerendered endpoint
// or static asset can answer.
export const match: ParamMatcher = (param) => {
	const lastSegment = param.split("/").pop() ?? "";
	return !lastSegment.includes(".");
};
