import * as Sentry from "@sentry/sveltekit";
import { handleErrorWithSentry } from "@sentry/sveltekit";

Sentry.init({
	dsn: "https://0a0947e58c272d15c7846335bc4d1a20@o4505247956860928.ingest.us.sentry.io/4510386382569479",

	tracesSampleRate: 1.0,

	// (enableLogs is gone in Sentry 11; logs are on by default.)

	// Sentry 11 replaced sendDefaultPii with the dataCollection option, and
	// its defaults are the documented equivalent of the sendDefaultPii: true
	// this client previously set, so the option is simply dropped rather
	// than translated. Tighten via dataCollection if that should change.
});

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = handleErrorWithSentry();
