import { sveltekit } from '@sveltejs/kit/vite';
import path from "path";

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],
	resolve: {
		alias: {
			$components: path.resolve("./src/lib/components"),
			$functions: path.resolve("./src/lib/functions"),
			$lib: path.resolve("./src/lib"),
			$settings: path.resolve("./src/lib/settings"),
			$stores: path.resolve("./src/lib/stores"),
			$types: path.resolve("./src/lib/types"),
		}
	}
};

export default config;
