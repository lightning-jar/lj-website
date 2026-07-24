# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [0.16.0] - 2026-07-24

### Added
- `docs/ai-writing-tells.md` + `docs/ai-writing-tells.grep`: a reviewed list of AI-slop writing tells (banned house-style items, vocabulary, phrases, structural patterns) with a greppable pattern file for scanning articles before publish; referenced from CLAUDE.md's new Editorial Style section.

## [0.15.0] - 2026-07-23

### Removed
- `static/blog/img/globe.webp`: imported into the replicator image repository (IMG-0007), which now serves the CCRTA transit-website article's hero image; the staged repo copy is no longer needed.

## [0.14.0] - 2026-07-23

### Added
- `static/blog/img/globe.webp`: temporary staging of the CCRTA bus-tracker article's hero image for import into the replicator image repository; will be removed once imported.

## [0.13.0] - 2026-07-22

### Removed
- `static/blog/img/mailbox.webp`: imported into the replicator image repository (IMG-0006), which now serves the cold-email article's hero image; the staged repo copy is no longer needed.

## [0.12.0] - 2026-07-22

### Added
- `static/blog/img/mailbox.webp`: temporary staging of the cold-email article's hero image so the replicator image repository can import it from a public URL; will be removed once imported.

## [0.11.0] - 2026-07-20

### Removed
- `static/blog/img/muddy-paw-prints.webp`: the Plausible article's hero image now serves from the replicator image repository (Vercel blob), so the repo copy added in 0.10.0 is unused.

## [0.10.0] - 2026-07-20

### Added
- Hero image for the upcoming "Why We Switched from Google Analytics to Plausible" article: `static/blog/img/muddy-paw-prints.webp` (watercolor paw prints, referenced from the replicator CMS draft).

## [0.9.0] - 2026-07-17

### Added
- Deployment-version polling (`kit.version.pollInterval: 60_000` in `svelte.config.js`): hydrated tabs poll `/_app/version.json` every 60s, and after a new deploy the next client-side navigation upgrades to a full page load so long-lived tabs stop running stale bundles. Takes effect for tabs opened on or after the first deploy that includes it.

## [0.8.0] - 2026-07-15

### Changed
- Home page hero panel: secondary CTA now reads "Our LLM Research" and links to the barkup-bench dashboard (/research/barkup-bench), replacing the Customer Stories link.

## [0.7.0] - 2026-07-14

### Changed
- Home page research panel: secondary CTA now points to The Builder's Playbook (/research/barkup-bench/playbook) instead of the Latest Findings post.

## [0.6.0] - 2026-07-14

### Fixed
- `parseMarkdown.ts` contained literal control bytes (raw `\x00` and `\x1f`) inside the unsafe-URL regex character class, which made git treat the file as binary. Replaced with the escaped `\x00-\x1f` text form; behavior unchanged.

## [0.5.0] - 2026-07-14

### Changed
- Markdown parsing migrated from the hand-rolled ~700-line parser to marked (GFM) + marked-footnote, configured identically to `@kevinpeckham/barkdown`'s `toDom` so rendered content stays in barkdown's canonical dialect. Site renderer extensions preserve what marked deliberately does not do: raw HTML is escaped under `sanitize` (br/hr/wbr allowlist kept), HTML comments are stripped, standalone images stay unwrapped from `<p>` (keeps the `img+p` caption CSS working), and `lazyImages` still adds `loading="lazy"`. `parseMarkdownTextToHtml` was fallow's top complexity hotspot (cognitive 73, cyclomatic 37); it is now thin glue, with ~400 lines of block/inline machinery deleted. Verified display-equivalent across all 42 posts; the golden-corpus fixture was regenerated, with residual byte diffs limited to entity encoding, `em`/`strong` nesting order, block whitespace, and more-correct `&amp;` escaping.
- New markdown capabilities inherited from marked: nested lists, multi-paragraph list items, reference links, footnotes, setext headings, and GFM table alignment.

### Fixed
- Links and images with `javascript:`, `vbscript:`, or `data:` URLs are now neutralized (anchor drops to its text, image to its alt). The old parser rendered `javascript:` hrefs intact.
- A table immediately followed by a thematic break without a blank line no longer renders the `<hr>` before the table.
- `seo-is-changing`: "1)"-style label lines escaped in the source so they stay paragraphs (marked reads `1)` as an ordered-list marker).
- `blog-article` highlighted-table-row selector now matches both `<strong><em>` and `<em><strong>` nesting.

## [0.4.0] - 2026-07-14

### Added
- Golden-corpus characterization test (`tests/blogCorpus.test.ts` + committed hash fixture): renders all 42 real blog posts through `parseMarkdown` and fails on any byte-level output change. Regenerate intentionally with `UPDATE_GOLDEN=1 bun test tests/blogCorpus.test.ts`. Groundwork for any future parser change (a barkdown/marked migration was spiked and found display-neutral on the full corpus; see repo discussion).

## [0.3.0] - 2026-07-14

### Added
- Test coverage for recent logic: param matchers (`slug`, `notfile`), a kebab-case invariant test over every blog and customer-story slug (the slug matcher 404s anything else), home-page research-stat interpolation, and the shared search-filter helpers. 106 tests total, up from 90.
- `.fallowrc.json` Fallow configuration. `fallow dead-code` and `fallow dupes` now run clean; `fallow health` scores maintainability 93.7 (good) with an advisory hotspot backlog. Vendored `bench-charts.js` excluded from duplication and health analysis; framework-consumed exports (`prerender`, adapter `config`, `instrumentation.server.ts`) carry inline suppressions.
- Shared modules extracted from duplicated page code: `SearchTagFilter.svelte` (search + tag chips on `/blog` and `/customer-stories`), `ProjectTile.svelte` (`/research` and `/fun` cards), `PanelAdvanceArrow.svelte` (`/services` and `/testimonials` arrow), and `src/lib/utils/searchFilter.ts` (term matching and tag toggling). Prerendered HTML for all seven touched pages verified identical against the pre-refactor build.

### Changed
- Dead code removed across the content getters (unused sitemap-meta arrays, reading-list slug helpers including a copy-pasted `getNextCustomerStorySlug` that shadowed the customer-stories one, `allTechnologyIds`), the audio layer (`warmup`, volume setters, `ensureAudioReady`), the unused `src/lib/settings/cdn.ts`, and the unused `Sitemap` type alias. Internal-only helpers un-exported (`escapeXML`, `slugify` named export, audio internals). `parseMarkdown` deduplicated via `transformOutsideCodeSpans` and a shared table-row renderer.
- Dropped unused devDependencies `@unocss/preset-web-fonts` and `nanoid`.

## [0.2.0] - 2026-07-14

### Added
- `/research` section: program landing page, the barkup-bench results dashboard (originally ported from the results artifact, then rebuilt as native SvelteKit + UnoCSS with no standalone CSS), and "The Builder's Playbook" practical-applications page. 301 redirect from the old `/barkup-bench` path. `src/lib/data/research-stats.json` is the single source of truth for benchmark headline numbers, interpolated into the home page via `{{placeholder}}` substitution.
- `/fun` section for open-source side projects, with tiles for Fifths, Donut Shooter, and Numberoo.
- `/about` page with studio copy drafted from the site's own content, plus a leadership line.
- Sixteen new customer stories (Sage Energy Holdings, Northgate González Market, TransTrack, Zenith Energy, Hark/MediaScience, Baloo, Zenith Capital Partners, Cappex & EAB, BlueLine Rental, United Rentals, Green Sprouts / O2C Brands, Avaya, Space Racers, Rigby Home, Blue Duck Scooters, CCRTA sitewide translation).
- Customer stories: headings split into heading + subtitle (subtitle in body font), search and tag filters on the listing page, "perspective" quote blocks, and a real `draft` flag that filters unpublished stories from listings, slug routes, sitemaps, and feeds (same flag honored for blog posts).
- Blog: search and tag-shortcut filtering on the index. Roughly twenty-five new posts, including the barkup-bench study series (Studies K through AC), the twenty-three-study capstone, barkup 0.3/0.4/0.5 and barkdown release posts, four side-project essays (F♯ Is Not G♭, The Browser Is an Instrument, The Number That Doesn't Fit in a Number, The Arcade Game With No Game Loop), and a Replicator dual-mode UnoCSS engineering post.
- Home page: optional primary/secondary CTA blocks on rotating messages, carousel position dots, two-paragraph pattern across all panels, and "Latest from our Blog" + "Latest Customer Stories" card grids. New panels: We Believe in Research, Fact vs. Fiction in the Age of LLMs, Your Brand Is the Experience.
- Nav: Research and Fun menu items; Home moved to first position.
- Param matchers `src/params/slug.ts` (kebab-case content slugs) and `src/params/notfile.ts` (rejects file-like paths), applied as `blog/[slug=slug]`, `customer-stories/[slug=slug]`, and `[...path=notfile]`.
- New blog article: "Pimcore or OpenDXP: A Fork in the Road for Long-Tenured DXP Stacks" (`src/lib/content/blog/20260517-opendxp-pimcore-fork.md`).
- Technology entries: OpenDXP, Socket.dev, Snyk, Varlock, 1Password, Fallow, Renovate.
- Reading-list entries: "Evolved antennas, LLM-generated code, and a potential antifuture" (Eric W. Bailey), "How I use LLMs as a staff engineer in 2026" (Sean Goedecke), "TanHacked — Syntax #1004" (Wes Bos & Scott Tolinski, transcript), "The Pre-Training Wall and the Treadmill After It — CoRecursive #121" (Adam Gordon Bell with Don McKay, transcript), "Why Federated Design Systems Keep Failing" (Shaun Bent), "How NASA Built Artemis II's Fault-Tolerant Computer" (Logan Kugler, CACM).
- Optional `relatedArticle` field on the `Technology` type, rendered on `/technologies`; Pimcore and OpenDXP entries link to the OpenDXP fork article.
- "Reading List" link in the global nav, between Customer Stories and Technologies.
- "2026 update" tout on `/archive/introduction-to-pimcore` linking to the OpenDXP fork article.
- Atom feeds: combined `/atom.xml` (blog + reading-list) plus section-specific `/blog/atom.xml` and `/reading-list/atom.xml`, all summary-only. Reading-list entries link to the external `url`; blog entries link to `/blog/{slug}`. Global layout advertises the combined feed; `/blog` and `/reading-list` pages also advertise their own feeds via `<link rel="alternate">` and a `FeedBadge` link in the page header (top right). Global footer has an "Atom Feed" link to the combined feed. `vercel.ts` sets `Content-Type: application/atom+xml; charset=utf-8` on all three feed paths (overrides the static-extension default of `application/xml`). Shared builder lives in `src/lib/utils/atomFeed.ts` + `src/lib/utils/feedEntries.ts`.
- Optional `notice` field on the `CustomerStory` type, rendered near the top of `customer-stories/[slug]`; set on the Beam Suntory story to surface the Pimcore licensing change and link the OpenDXP fork article.

### Changed
- Home hero retitled to "Design, Build & Brand Technology Studio" with matching meta description; hero copy rewritten around guiding clients through digital shifts into the LLM era. Retired the "Moving at the Speed of Good", "Digital From the Beginning", and "Saying No is a Superpower" panels. Ticker hidden and withheld from the page payload.
- `/technologies`: barkup copy refreshed for the 0.2–0.5 toolkit; barkdown entry added. `/built-with` audited against the current stack.
- Customer story titles gained technical summaries; `title` and `meta.title` aligned. Story tags normalized (deduplicated casing variants).
- Blog article sources unwrapped to one line per paragraph and bullet (no hard-wraps).
- Brand positioning copy added across home, services, and about.
- `open-source-b2b-advantage` ↔ `opendxp-pimcore-fork` reciprocal cross-link. In `open-source-b2b-advantage`: inline paragraph in the "No Vendor Lock-In" section noting Pimcore's 2025 relicensing as a real-world illustration of why license choice matters, plus an `additionalReading` entry pointing to `/blog/opendxp-pimcore-fork`. In `opendxp-pimcore-fork`: inline sentence at the end of "The Pattern, Stated Plainly" linking to `/blog/open-source-b2b-advantage` for the broader open-vs-proprietary argument (the OpenDXP article already listed the b2b piece in its `additionalReading`).
- `pimcore.json`: licensing copy updated for the GPLv3 → POCL transition and Pimcore 12 implications; `license` field revised accordingly.
- OpenDXP article: deduplicated sources — removed the in-body "Sources & Further Reading" section (it duplicated the sidebar and was inconsistent with other articles) and folded its 4 body-only links into frontmatter `sources:` (12 total, no links lost). Punctuation/em-dash copyedit pass.

### Fixed
- Client-side navigation to prerendered endpoints (`/sitemap.xml`, `/atom.xml`, `/blog/atom.xml`, `/robots.txt`) rendered a 404 while direct loads worked. The URLs matched dynamic page routes client-side (`blog/[slug]` matched `atom.xml` as a slug; the `[...path]` 404 catch-all matched the rest), so the router intercepted the click instead of letting the browser request the static file. The new `slug` and `notfile` param matchers decline file-like URLs; with no matching route, SvelteKit falls back to native navigation. (An interim `data-sveltekit-reload` patch on individual links was reverted in favor of this.)
- Atkinson Hyperlegible now loads at weight 700 so `<strong>` text renders bold.
- Study V chart was invisible on the dark dashboard page.
- `seo-is-changing` frontmatter corrected (bad copy from the WordPress original).
- Line starting with "45." in a blog article rendered as a stray ordered list.
- OpenDXP article: reversed "MariaDB → MySQL (2009)" section heading corrected to "MySQL → MariaDB (2009)" — MySQL is upstream, MariaDB is the fork (matches the Original → Fork pattern used throughout the section and the prose).
- `/sitemap.xml` 500 crash in production (`FUNCTION_INVOCATION_FAILED`). The endpoint lacked `export const prerender = true`, so it ran as a request-time serverless function resolving `varlock/env`, which has no resolution context in the Vercel runtime (the varlock migration replaced build-time-inlined `$env/static/private`). Now prerendered like the rest of the site; served as a static file with `ENV` resolved at build time.
- `vercel.ts` was being silently ignored on deploy: `@vercel/config` reads `module.default` for the root config, but the file used `export const config`, which the CLI collected as a nested `{ config: {...} }` instead of the top-level shape Vercel expects. Switched to `export default config`. `npx @vercel/config validate` now reports 8 redirects + 1 headers block (was 0/0), so all security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) and the legacy URL redirects from `vercel.ts` will actually be applied in production.
- `/services` lightning-bolt click animation: bolt was rendering in the dark `oxford` color instead of `maximumYellow` because `hover:text-maximumYellow` was being overridden by the earlier `hover:text-oxford` in the same class string. Added the `!` important modifier (`hover:!text-maximumYellow`) to match the working `/testimonials` page.

## [0.1.0] - 2026-04-18

### Added
- `varlock` + `@varlock/vite-integration` for env-var management. `.env.schema` is the source of truth; `src/env.d.ts` is auto-generated.
- `@vercel/config` typed deployment config in `vercel.ts` (replaces `vercel.json`).
- `varlock typegen` step wired into `prepare`, `check`, and `check:watch` scripts.

### Changed
- Migrated env imports from `$env/static/private` to `import { ENV } from "varlock/env"` in `src/routes/+layout.server.ts` and `src/routes/sitemap.xml/+server.ts`.
- `src/hooks.server.ts`: server runtime bumped to `nodejs24.x` to match `engines.node`. Switched the `config` export to TypeScript syntax using `Config` type from `@sveltejs/adapter-vercel`.
- `biome.json`: schema URL bumped to `2.4.12` to match installed `@biomejs/biome`.
- `package.json`: moved `happy-dom` from `dependencies` to `devDependencies`.

### Removed
- `vercel.json` (replaced by `vercel.ts`).
- Manual `declare module "$env/static/private"` block in `src/app.d.ts` (varlock generates types).
- `biome@0.3.3` — unrelated npm package, not the Biome formatter (which is `@biomejs/biome` in devDependencies).
- `baseline-browser-mapping` direct dep — already pulled in transitively via `browserslist`.

### Fixed
- Vercel production build failure caused by `@prisma/instrumentation` (Sentry transitive dep) resolving `@opentelemetry/instrumentation@0.207.0` under Node 24's stricter ESM resolver. Incidental fix from lockfile regeneration after dependency cleanup; upstream issue: [getsentry/sentry-javascript#19902](https://github.com/getsentry/sentry-javascript/issues/19902).
- Trailing space in `/assets/favicon/lj-favicon.svg ` redirect source (broke the redirect match).
