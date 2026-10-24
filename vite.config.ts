import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig, loadEnv } from "vite";

import UnoCSS from "unocss/vite";

import { sentrySvelteKit } from "@sentry/sveltekit/vite";

import { default as vercel } from "@sveltejs/adapter-vercel";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { varlockVitePlugin } from "@varlock/vite-integration";

// SvelteKit 3 removed svelte.config.js: project config is passed to the
// sveltekit() plugin below, with what used to live under `kit.*` hoisted
// to the top level alongside `compilerOptions`.
//
// There is no `alias` map: everything under src/lib is reached through the
// `#lib/*` subpath import declared in package.json, which Vite, TypeScript
// and Bun all resolve natively (matching slx-web). Subpath imports need an
// explicit extension, so `.ts` modules are imported as `#lib/utils/x.js`.
export default defineConfig(({ mode }) => {
	// loadEnv reads .env / .env.local at config-load time so SENTRY_AUTH_TOKEN
	// (used only for source-map upload) can come from .env.local locally or
	// from Vercel project env vars in CI. Values resolved later by the
	// varlock plugin are NOT visible here.
	const env = loadEnv(mode, process.cwd(), "");

	return {
		plugins: [
			// resolved-env inlines resolved ENV values into the server bundle at
			// build time, so the Vercel serverless function never runs varlock's
			// loader at request time (it has no .env.schema there and crashed at
			// module init, 500ing every non-prerendered request).
			//
			// Order matters: varlock must come before sentrySvelteKit() and
			// sveltekit().
			varlockVitePlugin({ ssrInjectMode: "resolved-env" }),
			// Sentry 11 moved this plugin to the /vite subpath and flattened
			// sourceMapsUploadOptions to the top level.
			sentrySvelteKit({
				org: "lightning-jar",
				project: "lj-website",
				authToken: env.SENTRY_AUTH_TOKEN,
				// Upload source maps only from Vercel builds (Vercel sets
				// VERCEL=1 at build time). Local builds would otherwise push
				// maps for code that never ships, polluting Sentry releases,
				// and fail the build with a 401 when no token is present.
				autoUploadSourceMaps: process.env.VERCEL === "1",
			}),
			UnoCSS(),
			sveltekit({
				// Pin the serverless runtime here. Without this the adapter
				// derives it from whatever Node version ran the build, so a
				// build on Node 22 would quietly ship nodejs22.x functions. (The
				// `config` export in hooks.server.ts never did this: adapters
				// only read `config` from route files, not from hooks.)
				adapter: vercel({ runtime: "nodejs24.x" }),

				preprocess: vitePreprocess(),

				// Server-side instrumentation loads automatically from
				// src/instrumentation.server.ts; this opts into the OpenTelemetry
				// spans that feed Sentry tracing.
				tracing: {
					server: true,
				},

				// Poll /_app/version.json so long-lived tabs detect new deploys;
				// the next client-side navigation becomes a full page load on the
				// new bundle. SvelteKit 3 also checks on navigation and on tab
				// focus, so this interval is a backstop for idle tabs (the default
				// is one hour).
				version: {
					pollInterval: 60_000,
				},

				compilerOptions: {
					discloseVersion: false,
					runes: true,
				},
			}),
		],
		assetsInclude: ["**/*.svg", "**/*.txt"],
		server: {
			// Pin the dev server to a distinct port (same convention as
			// replicator's 5183) so other projects grabbing Vite's default
			// 5173/5174 can't collide with it; strictPort fails fast instead
			// of silently drifting, which would break pinned dev origins
			// (reverse proxies, tunnels).
			port: 5193,
			strictPort: true,
			// Extra dev-server hostnames (comma-separated), e.g. a remote dev
			// box's proxy + tailnet names. Vite's own
			// __VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS only carries ONE host, so
			// multi-host setups opt in here. Unset = Vite's default host check.
			allowedHosts: process.env.DEV_ALLOWED_HOSTS?.split(",").filter(Boolean),
		},
	};
});
