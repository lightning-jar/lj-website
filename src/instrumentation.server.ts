import * as Sentry from "@sentry/sveltekit";

Sentry.init({
	dsn: "https://0a0947e58c272d15c7846335bc4d1a20@o4505247956860928.ingest.us.sentry.io/4510386382569479",

	tracesSampleRate: 1.0,

	// Enable logs to be sent to Sentry
	enableLogs: true,

	// uncomment the line below to enable Spotlight (https://spotlightjs.com)
	// spotlight: import.meta.env.DEV,
});
