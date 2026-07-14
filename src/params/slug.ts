import type { ParamMatcher } from "@sveltejs/kit";

// Kebab-case content slugs only. Rejecting file-like params (e.g. "atom.xml")
// keeps endpoint URLs out of the client router, which then falls back to a
// full-page request that the prerendered endpoint can answer.
export const match: ParamMatcher = (param) =>
	/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(param);
