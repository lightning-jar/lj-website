import * as Sentry from "@sentry/sveltekit";
import { handleErrorWithSentry } from "@sentry/sveltekit";
import {
	handlePreloadError,
	type PreloadErrorEvent,
} from "#lib/utils/chunkLoadRecovery.js";

Sentry.init({
	dsn: "https://0a0947e58c272d15c7846335bc4d1a20@o4505247956860928.ingest.us.sentry.io/4510386382569479",

	// Without an explicit environment the SDK defaults to "production", so
	// errors from `vite dev` (e.g. HMR mid-edit) were filed as production.
	environment: import.meta.env.DEV ? "development" : "production",

	tracesSampleRate: 1.0,

	// (enableLogs is gone in Sentry 11; logs are on by default.)

	// Sentry 11 replaced sendDefaultPii with the dataCollection option, and
	// its defaults are the documented equivalent of the sendDefaultPii: true
	// this client previously set, so the option is simply dropped rather
	// than translated. Tighten via dataCollection if that should change.
});

// SvelteKit awaits the root +error.svelte chunk during startup; if the
// browser fails to fetch it, hydration aborts (LJ-WEBSITE-30). Recover that
// one chunk and report it as a handled warning; other chunk failures still
// throw and are reported as errors.
if (typeof window !== "undefined") {
	window.addEventListener("vite:preloadError", (event) => {
		handlePreloadError(event as PreloadErrorEvent, (error, context) => {
			Sentry.captureException(error, context);
		});
	});
}

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = handleErrorWithSentry();
