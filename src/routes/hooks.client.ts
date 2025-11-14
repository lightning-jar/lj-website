import { handleErrorWithSentry } from "@sentry/sveltekit";
import * as Sentry from "@sentry/sveltekit";

Sentry.init({
	dsn: "https://09c929d25a434fd8b135b1d788a6b3d3@o4505247956860928.ingest.sentry.io/4505488982147072",
	// tracesSampleRate: 0.1,
	tracesSampleRate: 0,

	// This sets the sample rate to be 10%. You may want this to be 100% while
	// in development and sample at a lower rate in production
	// replaysSessionSampleRate: 0.1,
	replaysSessionSampleRate: 0,

	// If the entire session is not sampled, use the below sample rate to sample
	// sessions when an error occurs.
	// replaysOnErrorSampleRate: 1.0,
	replaysOnErrorSampleRate: 0,

	// If you don't want to use Session Replay, just remove the line below:
	// integrations: [new Replay()],
});

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = handleErrorWithSentry();
