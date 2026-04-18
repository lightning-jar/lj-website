# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

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
