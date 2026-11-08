// Span naming for the Replicator CMS fetches.
//
// The server pins `dataCollection.urlQueryParams: false`
// (instrumentation.server.ts), so the auto-instrumented http.client
// spans for `/api/public/blog/articles?collection=…` all show the same
// bare URL. A homepage render fetches three different collections in
// parallel, and with identical span URLs they look like redundant calls.
// This helper turns a CMS URL into a span name and attributes that keep
// those requests distinguishable. It only reads the non-secret routing
// params the getters set themselves (the API key travels in a header),
// and it imports nothing so it stays unit-testable.

export interface CmsSpanInfo {
	name: string;
	attributes: Record<string, string | number>;
}

const ARTICLES_PATH = "/api/public/blog/articles";

export function cmsSpanInfo(url: string): CmsSpanInfo {
	let parsed: URL;
	try {
		parsed = new URL(url);
	} catch {
		return { name: "cms fetch", attributes: {} };
	}

	const path = parsed.pathname.replace(/\/$/, "");
	const params = parsed.searchParams;
	const attributes: Record<string, string | number> = { "cms.path": path };

	if (path === ARTICLES_PATH || path.startsWith(`${ARTICLES_PATH}/`)) {
		// no `collection` param means the default blog collection
		const collection = params.get("collection") ?? "blog";
		attributes["cms.collection"] = collection;

		const limit = Number(params.get("limit"));
		if (Number.isFinite(limit) && limit > 0) attributes["cms.limit"] = limit;

		if (path === ARTICLES_PATH) {
			return { name: `cms list ${collection}`, attributes };
		}
		const slug = decodeURIComponent(path.slice(ARTICLES_PATH.length + 1));
		attributes["cms.slug"] = slug;
		return { name: `cms article ${collection}`, attributes };
	}

	return { name: `cms fetch ${path}`, attributes };
}
