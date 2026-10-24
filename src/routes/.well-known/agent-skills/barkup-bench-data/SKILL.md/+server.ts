import type { RequestHandler } from "./$types";

import skillMd from "#lib/content/skills/barkup-bench-data/SKILL.md?raw";

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
