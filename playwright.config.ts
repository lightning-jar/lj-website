import { defineConfig, devices } from "@playwright/test";

// Accessibility audit only (axe-core over rendered pages): `bun run test:a11y`.
// Not part of `bun run test` (Vitest) and not a CI gate: CI has no secrets,
// and the pages fetch their content from the Replicator CMS at request time,
// so there is nothing to render there. Run it locally against the dev server
// (started here unless one is already up on 5193), or point A11Y_BASE_URL at
// a deployment, e.g. A11Y_BASE_URL=https://www.lightningjar.com.
const BASE_URL =
	process.env.A11Y_BASE_URL?.replace(/\/$/, "") || "http://localhost:5193";
const LOCAL = BASE_URL.startsWith("http://localhost");

export default defineConfig({
	testDir: "e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	reporter: [["list"]],
	timeout: 60_000,
	use: {
		baseURL: BASE_URL,
		...devices["Desktop Chrome"],
	},
	webServer: LOCAL
		? {
				command: "bun dev",
				url: BASE_URL,
				reuseExistingServer: true,
				timeout: 120_000,
			}
		: undefined,
});
