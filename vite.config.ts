import { sentrySvelteKit } from "@sentry/sveltekit";
import { sveltekit } from "@sveltejs/kit/vite";
import { varlockVitePlugin } from "@varlock/vite-integration";
import UnoCSS from "unocss/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		varlockVitePlugin(),
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
