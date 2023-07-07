import vercel from "@sveltejs/adapter-vercel";
import preprocess from "svelte-preprocess";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),
	kit: {
		adapter: vercel({
			// make explicit -- vercel does not yet support later node versions
			runtime: "nodejs18.x",
		}),
		alias: {
			$atoms: "./src/lib/components/atoms",
			$assets: "./src/lib/assets",
			$molecules: "./src/lib/components/molecules",
			$organisms: "./src/lib/components/organisms",
			$components: "./src/lib/components",
			$data: "./src/lib/data",
			$functions: "./src/lib/functions",
			$settings: "./src/lib/settings",
			$stores: "./src/lib/stores",
			$types: "./src/lib/types",
			$utils: "./src/lib/utils",
		},
		csp: {
			directives: {
				"script-src": [
					"self",
					"*.youtube.com",
					"*.vimeo.com",
					"*.jotform.com",
					"plausible.io", // 3rd party analytics -- replaces Google Analytics
					"*.sentry.io", // error tracking
				],
				"style-src": ["self", "unsafe-inline"],
				"worker-src": ["self", "blob:"],
				"child-src": [
					"self",
					"blob:",
					"*.jotform.com",
					"*.vimeo.com",
					"*.youtube.com",
				],
			},
		},
	},
};

export default config;
