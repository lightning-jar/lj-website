/**
 * Recovery for failed loads of SvelteKit's root error-page chunk.
 *
 * SvelteKit's client `start()` eagerly imports the root layout AND the root
 * `+error.svelte` node (`nodes/1.<hash>.js`) with
 * `await Promise.all([layout(), error()])`. If the browser fails to fetch the
 * error-page chunk (ad blocker, flaky connection, request dropped before it
 * hits the network - LJ-WEBSITE-30 showed status 0, no TTFB), that rejection
 * aborts `start()`: the server-rendered page is shown but never hydrates.
 *
 * The eagerly loaded error node is not used during startup; it is only needed
 * when an error page must actually be rendered, and SvelteKit calls the loader
 * again at that point. So for this one chunk we cancel Vite's
 * `vite:preloadError` event (which makes the import resolve instead of
 * reject), letting hydration finish, and still report the failure as a
 * handled warning with the chunk URL attached. Every other chunk failure is
 * left untouched so it keeps surfacing as an error.
 */

export type PreloadErrorEvent = Event & { payload?: unknown };

export type CaptureFn = (
	error: unknown,
	context: {
		level: "warning";
		tags: Record<string, string>;
	},
) => void;

const ROOT_ERROR_NODE_RE = /\/_app\/immutable\/nodes\/1\.[\w-]+\.js/;

/** Extract the chunk URL from a failed dynamic import error, if present. */
export function failedChunkUrl(error: unknown): string | undefined {
	const message =
		error instanceof Error
			? error.message
			: typeof error === "string"
				? error
				: undefined;
	if (!message) return undefined;
	const match = message.match(/https?:\/\/\S+?\.js|\/_app\/\S+?\.js/);
	return match?.[0];
}

/** True when the URL is SvelteKit's root error-page node (nodes/1). */
export function isRootErrorNode(url: string | undefined): boolean {
	return !!url && ROOT_ERROR_NODE_RE.test(url);
}

/**
 * Handle a `vite:preloadError` event. Returns true when the failure was the
 * root error-page chunk and has been recovered (and reported as a warning).
 */
export function handlePreloadError(
	event: PreloadErrorEvent,
	capture: CaptureFn,
): boolean {
	const url = failedChunkUrl(event.payload);
	if (!isRootErrorNode(url)) return false;

	event.preventDefault();
	capture(event.payload, {
		level: "warning",
		tags: { chunk_url: url as string, chunk_recovered: "true" },
	});
	return true;
}
