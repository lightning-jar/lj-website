import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

// WCAG 2.2 A/AA. Violations of impact "serious" or "critical" fail the test;
// "minor"/"moderate" ones are attached to the report as annotations so they
// stay visible without blocking.
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const BLOCKING = new Set(["serious", "critical"]);

const PROD_ORIGIN = "https://www.lightningjar.com";

// Static routes. Preview routes (/blog/preview/[token], …) are token-gated
// and left out.
const STATIC_ROUTES = [
	"/",
	"/about",
	"/services",
	"/packages",
	"/technologies",
	"/customer-stories",
	"/testimonials",
	"/blog",
	"/findings",
	"/reading-list",
	"/research",
	"/research/aeo-bench",
	"/research/stem-bench",
	"/research/barkup-bench",
	"/built-with",
	"/ask-eljay",
	"/ljx",
	"/fun",
	"/feeds",
	"/sitemap",
	"/archive",
	"/terms",
	"/this-page-does-not-exist",
];

// Content-driven templates: audit the first item linked from each index,
// so every [slug] template is covered once without hard-coding CMS slugs.
const DETAIL_INDEXES = [
	{ index: "/blog", prefix: "/blog/" },
	{ index: "/customer-stories", prefix: "/customer-stories/" },
	{ index: "/findings", prefix: "/findings/" },
	{ index: "/reading-list", prefix: "/reading-list/" },
	{ index: "/technologies", prefix: "/technologies/" },
	{ index: "/packages", prefix: "/packages/" },
];

// Against production, send the smoketest bypass header (see CLAUDE.md →
// "Firewall bypass for probes") on first-party requests only, never to
// third-party hosts the page loads.
test.beforeEach(async ({ page, baseURL }) => {
	const token = process.env.SMOKETEST_TOKEN?.trim();
	if (baseURL !== PROD_ORIGIN || !token) return;
	await page.route(`${PROD_ORIGIN}/**`, (route) =>
		route.continue({
			headers: { ...route.request().headers(), "x-smoketest-token": token },
		}),
	);
});

async function audit(page: Page, path: string) {
	await page.goto(path, { waitUntil: "networkidle" });
	const { violations } = await new AxeBuilder({ page })
		.withTags(WCAG_TAGS)
		.analyze();

	for (const v of violations.filter((v) => !BLOCKING.has(v.impact ?? ""))) {
		test.info().annotations.push({
			type: `a11y:${v.impact}`,
			description: `${v.id} (${v.nodes.length}×): ${v.help}`,
		});
	}

	const blocking = violations
		.filter((v) => BLOCKING.has(v.impact ?? ""))
		.map((v) => ({
			rule: v.id,
			impact: v.impact,
			help: v.help,
			url: v.helpUrl,
			nodes: v.nodes.length,
			targets: v.nodes.slice(0, 5).map((n) => n.target.join(" ")),
		}));
	expect(blocking, `serious/critical axe violations on ${path}`).toEqual([]);
}

for (const path of STATIC_ROUTES) {
	test(`a11y ${path}`, async ({ page }) => {
		await audit(page, path);
	});
}

for (const { index, prefix } of DETAIL_INDEXES) {
	test(`a11y ${prefix}[first]`, async ({ page }) => {
		await page.goto(index);
		// Resolve each link against the page (the blog index uses relative
		// hrefs like "blog/<slug>"), then keep same-origin detail paths, skipping
		// feeds and other files (atom.xml, …) and preview links.
		const paths = await page
			.locator("a[href]")
			.evaluateAll((as) =>
				(as as HTMLAnchorElement[])
					.filter((a) => a.origin === location.origin)
					.map((a) => a.pathname),
			);
		const detail = paths.find(
			(p) =>
				p.startsWith(prefix) &&
				p.length > prefix.length &&
				!p.includes("/preview/") &&
				!/\.[a-z0-9]+$/i.test(p),
		);
		test.skip(!detail, `no ${prefix} link found on ${index}`);
		await audit(page, detail as string);
	});
}
