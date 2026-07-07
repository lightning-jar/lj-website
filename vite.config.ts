import { sentrySvelteKit } from "@sentry/sveltekit";
import { sveltekit } from "@sveltejs/kit/vite";
import { varlockVitePlugin } from "@varlock/vite-integration";
import UnoCSS from "unocss/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		// resolved-env inlines resolved ENV values into the server bundle at
		// build time, so the Vercel serverless function never runs varlock's
		// loader at request time (it has no .env.schema there and crashed at
		// module init, 500ing every non-prerendered request).
		varlockVitePlugin({ ssrInjectMode: "resolved-env" }),
		sentrySvelteKit({
			sourceMapsUploadOptions: {
				org: "lightning-jar",
				project: "lj-website",
			},
		}),
		UnoCSS(),
		sveltekit(),
	],
	assetsInclude: ["**/*.svg", "**/*.txt"],
});
