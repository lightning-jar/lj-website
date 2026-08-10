// Shared fetch for the Replicator CMS getters, carrying the resilience
// stack from the 2026-08-10 outage:
//
// 1. Legible failures — a non-JSON response (e.g. an auth redirect to a
//    sign-in page) used to surface as `SyntaxError: Unexpected token
//    '<'` deep in a getter; it is now a crisp, diagnosable error.
// 2. Last-known-good — every successful fetch is stored (Upstash +
//    in-memory); when the CMS is down, the stored copy serves and the
//    site stays up on slightly stale content.
// 3. When there is truly no copy to serve, callers in page loads get a
//    503 (come back later) instead of a generic 500.

import { error } from "@sveltejs/kit";

import { createLastKnownGood } from "$lib/server/lastKnownGood";
import { ENV } from "varlock/env";

type Fetch = typeof globalThis.fetch;

const lkg = createLastKnownGood({
	prefix: "lkg:v1",
	redisUrl: ENV.KV_REST_API_URL || undefined,
	redisToken: ENV.KV_REST_API_TOKEN || undefined,
});

/**
 * Fetch a CMS JSON endpoint with the last-known-good safety net.
 *
 * `notFoundValue`: some getters treat a 404 as data ("no such slug") —
 * pass the value to return for 404s so they are not cached or retried
 * as failures.
 */
export async function cmsJson<T>(
	fetch: Fetch,
	url: string,
	headers: HeadersInit,
	notFoundValue?: T,
): Promise<T> {
	try {
		return await lkg.wrap<T>(url, async () => {
			const res = await fetch(url, { headers, cache: "force-cache" });
			if (res.status === 404 && notFoundValue !== undefined) {
				return notFoundValue;
			}
			if (!res.ok) throw new Error(`CMS fetch failed: ${res.status} ${url}`);
			const contentType = res.headers.get("content-type") ?? "";
			if (!contentType.includes("json")) {
				// an HTML response here usually means an auth redirect — the
				// exact signature of the anonymous-lockout incident
				throw new Error(
					`CMS returned ${contentType || "unknown content"} instead of JSON (redirect or error page?): ${url}`,
				);
			}
			return (await res.json()) as T;
		});
	} catch (err) {
		// no live response and no stored copy: tell crawlers and humans to
		// come back rather than presenting a permanent-looking failure
		console.error("cmsJson: no last-known-good available:", err);
		error(503, "Content is temporarily unavailable. Please try again soon.");
	}
}
