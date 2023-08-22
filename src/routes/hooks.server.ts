// serverless Functions
/** @type {import('@sveltejs/adapter-vercel').Config} */
export const config = {
	runtime: "nodejs18.x",
};

// svelte functions
import { sequence } from "@sveltejs/kit/hooks";

// SENTRY
// import sentry
import * as Sentry from "@sentry/sveltekit";
import { handleErrorWithSentry } from "@sentry/sveltekit";

//initialize sentry
Sentry.init({
	dsn: "https://09c929d25a434fd8b135b1d788a6b3d3@o4505247956860928.ingest.sentry.io/4505488982147072",
	// Performance Monitoring
	tracesSampleRate: 0.0, // Capture 0% of the transactions. Adjust this value in production as necessary.
});

// handle errors with sentry
export const handleError = handleErrorWithSentry();

// handle function
import type { Handle } from "@sveltejs/kit";

// local data & settings
import { default as nav } from "$data/nav.json";

// types

export const handle: Handle = sequence(
	// sentry
	Sentry.sentryHandle(),

	async ({ event, resolve }) => {
		event.locals = {
			nav: nav,
		};

		const response = await resolve(event);
		return response;
	},
);
