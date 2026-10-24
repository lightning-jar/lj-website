import { defineConfig } from "vitest/config";

// Standalone: this config deliberately does NOT extend vite.config.ts and
// does NOT load the sveltekit() plugin. There are no .svelte component
// tests here, so pulling the Kit plugin (plus varlock, Sentry and the
// Vercel adapter) into every test run would cost startup time and buy
// nothing. Running through Vite does mean tests share the app's module
// resolution, which is the point of moving off `bun test`: `#lib/*`
// subpath imports resolve exactly as they do in dev and in the build.
export default defineConfig({
	test: {
		include: ["tests/**/*.test.ts"],
		// Node by default. The one suite that needs a DOM opts in with a
		// `// @vitest-environment happy-dom` docblock at the top of the file.
		environment: "node",
		coverage: {
			provider: "v8",
			include: ["src/**/*.{ts,svelte}", "scripts/**/*.ts"],
			exclude: ["src/**/*.d.ts", "src/routes/**/+*.{ts,svelte}"],
		},
	},
});
