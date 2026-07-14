import { handleErrorWithSentry, sentryHandle } from "@sentry/sveltekit";
import { sequence } from "@sveltejs/kit/hooks";
import type { Config } from "@sveltejs/adapter-vercel";

// adapter-vercel route config, read by the framework
// fallow-ignore-next-line unused-export
export const config: Config = {
	runtime: "nodejs24.x",
};

// If you have custom handlers, make sure to place them after `sentryHandle()` in the `sequence` function.
export const handle = sequence(sentryHandle());

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = handleErrorWithSentry();
