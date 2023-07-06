import adapter from '@sveltejs/adapter-auto';
import preprocess from 'svelte-preprocess';
import path from "path";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess({
		postcss: true,
	}),
	kit: {
		adapter: adapter(),
		alias: {
			$a: path.resolve("./src/lib/components/atoms"),
			$m: path.resolve("./src/lib/components/molecules"),
			$o: path.resolve("./src/lib/components/organisms"),
      $components: path.resolve("./src/lib/components"),
			$functions: path.resolve("./src/lib/functions"),
			$h: path.resolve("./src/lib/functions/helpers"),
      $settings: path.resolve("./src/lib/settings"),
      $stores: path.resolve("./src/lib/stores"),
      $types: path.resolve("./src/lib/types"),
    }
	}
};

export default config;
