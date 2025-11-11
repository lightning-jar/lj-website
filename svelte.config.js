// preprocessor
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

// vercel adapter
import { default as vercel } from "@sveltejs/adapter-vercel";

const aliasList = {
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

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: vercel(),
		alias: aliasList,
	},
	compilerOptions: {
		discloseVersion: false,
		runes: true,
	},
};

export default config;
