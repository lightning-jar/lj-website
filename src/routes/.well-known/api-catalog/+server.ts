import { API_CATALOG, API_CATALOG_CONTENT_TYPE } from "$utils/apiCatalog";

import type { RequestHandler } from "./$types";

// API catalog (RFC 9727): linkset advertising this site's public,
// keyless agent-facing endpoints. Static content, but served from a
// route so the linkset media type (with its RFC 9727 profile
// parameter, §4.2) is guaranteed. Catalog content and rationale live
// in $utils/apiCatalog, where tests pin the RFC shape.
export const prerender = false;

export const GET: RequestHandler = () =>
	new Response(JSON.stringify(API_CATALOG, null, "\t"), {
		headers: {
			"content-type": API_CATALOG_CONTENT_TYPE,
			"cache-control": "public, s-maxage=86400, stale-while-revalidate=86400",
		},
	});
