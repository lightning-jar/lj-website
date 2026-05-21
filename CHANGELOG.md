# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- New blog article: "Pimcore or OpenDXP: A Fork in the Road for Long-Tenured DXP Stacks" (`src/lib/content/blog/20260517-opendxp-pimcore-fork.md`).
- Technology entries: OpenDXP, Socket.dev, Snyk, Varlock, 1Password, Fallow.
- Reading-list entries: "Evolved antennas, LLM-generated code, and a potential antifuture" (Eric W. Bailey), "How I use LLMs as a staff engineer in 2026" (Sean Goedecke), "TanHacked — Syntax #1004" (Wes Bos & Scott Tolinski, transcript), "The Pre-Training Wall and the Treadmill After It — CoRecursive #121" (Adam Gordon Bell with Don McKay, transcript).
- Optional `relatedArticle` field on the `Technology` type, rendered on `/technologies`; Pimcore and OpenDXP entries link to the OpenDXP fork article.
- "Reading List" link in the global nav, between Customer Stories and Technologies.
- "2026 update" tout on `/archive/introduction-to-pimcore` linking to the OpenDXP fork article.
- Optional `notice` field on the `CustomerStory` type, rendered near the top of `customer-stories/[slug]`; set on the Beam Suntory story to surface the Pimcore licensing change and link the OpenDXP fork article.

### Changed
- `pimcore.json`: licensing copy updated for the GPLv3 → POCL transition and Pimcore 12 implications; `license` field revised accordingly.
- OpenDXP article: deduplicated sources — removed the in-body "Sources & Further Reading" section (it duplicated the sidebar and was inconsistent with other articles) and folded its 4 body-only links into frontmatter `sources:` (12 total, no links lost). Punctuation/em-dash copyedit pass.

### Fixed
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
