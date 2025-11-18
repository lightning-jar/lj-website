import { sentrySvelteKit } from "@sentry/sveltekit";
import { sveltekit } from "@sveltejs/kit/vite";
import UnoCSS from "unocss/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
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
