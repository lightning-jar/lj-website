import { sentrySvelteKit } from "@sentry/sveltekit/vite";
import { default as vercel } from "@sveltejs/adapter-vercel";
import { sveltekit } from "@sveltejs/kit/vite";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { varlockVitePlugin } from "@varlock/vite-integration";
import UnoCSS from "unocss/vite";
import { defineConfig } from "vite";

// SvelteKit 3 removed svelte.config.js: project config is passed to the
// sveltekit() plugin below, with what used to live under `kit.*` hoisted
// to the top level alongside `compilerOptions`.
//
// `alias` is deprecated in favour of package.json subpath imports
// ("#lib/foo.js"), but subpath imports require a file extension on every
// import specifier. Keeping the alias map preserves this repo's
// extensionless `$content/...` convention; revisit if the option is
// actually removed.
const aliasList = {
	$attachments: "./src/lib/attachments",
	$assets: "./src/lib/assets",
	$components: "./src/lib/components",
	$config: "./src/lib/config",
	$content: "./src/lib/content",
	$data: "./src/lib/data",
	$lib: "./src/lib",
	$handlers: "./src/handlers",
	$routes: "./src/routes",
	$settings: "./src/lib/settings",
	$server: "./src/server",
	$stores: "./src/stores",
	$types: "./src/lib/types",
	$utils: "./src/lib/utils",
};

export default defineConfig({
	plugins: [
		// resolved-env inlines resolved ENV values into the server bundle at
		// build time, so the Vercel serverless function never runs varlock's
		// loader at request time (it has no .env.schema there and crashed at
		// module init, 500ing every non-prerendered request).
		varlockVitePlugin({ ssrInjectMode: "resolved-env" }),
		// Sentry 11 moved this plugin to the /vite subpath and flattened
		// sourceMapsUploadOptions to the top level.
		sentrySvelteKit({
			org: "lightning-jar",
			project: "lj-website",
		}),
		UnoCSS(),
		sveltekit({
			// Pin the serverless runtime here. Without this the adapter
			// derives it from whatever Node version ran the build, so a
			// build on Node 22 would quietly ship nodejs22.x functions. (The
			// `config` export in hooks.server.ts never did this: adapters
			// only read `config` from route files, not from hooks.)
			adapter: vercel({ runtime: "nodejs24.x" }),

			alias: aliasList,

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
});
