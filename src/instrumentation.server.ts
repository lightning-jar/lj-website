// Loaded automatically by SvelteKit because this file exists (SvelteKit 3
// dropped the experimental.instrumentation.server opt-in); the matching
// tracing.server flag lives in vite.config.ts.
// fallow-ignore-file unused-file
import * as Sentry from "@sentry/sveltekit";

Sentry.init({
	dsn: "https://0a0947e58c272d15c7846335bc4d1a20@o4505247956860928.ingest.us.sentry.io/4510386382569479",

	tracesSampleRate: 1.0,

	// (enableLogs is gone in Sentry 11; logs are on by default.)

	// This server never set sendDefaultPii, so under Sentry 10 it collected
	// none of this. Sentry 11 flipped the defaults on (user info, cookies,
	// headers, bodies, query params, and GenAI inputs/outputs), which would
	// start shipping visitor data and the prompts and completions passing
	// through /api/concierge and /api/transcribe. Pin the old baseline
	// explicitly instead of inheriting the new one.
	dataCollection: {
		userInfo: false,
		cookies: false,
		httpHeaders: false,
		httpBodies: [],
		urlQueryParams: false,
		genAI: { inputs: false, outputs: false },
	},

	// uncomment the line below to enable Spotlight (https://spotlightjs.com)
	// spotlight: import.meta.env.DEV,
});
