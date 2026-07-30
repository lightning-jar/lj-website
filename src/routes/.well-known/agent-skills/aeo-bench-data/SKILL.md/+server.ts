import skillMd from "$content/skills/aeo-bench-data/SKILL.md?raw";

import type { RequestHandler } from "./$types";

// The skill artifact itself; served from source so the sha256 digest in
// ../index.json is always computed from these exact bytes.
export const prerender = false;

export const GET: RequestHandler = () =>
	new Response(skillMd, {
		headers: {
			"content-type": "text/markdown; charset=utf-8",
			"cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
		},
	});
