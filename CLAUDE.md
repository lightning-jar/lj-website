# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lightning Jar website - a static-first, content-driven marketing site built with SvelteKit 3.x and Svelte 5 (runes mode).

## Commands

```bash
bun dev              # Start dev server (localhost:5193, pinned/strict)
bun build            # Production build → .vercel/output
bun preview          # Preview production build locally
bun test             # Run tests (Bun test runner)
bun test --watch     # Watch mode for tests
bun run check        # TypeScript + Svelte type checking
bun run check:watch  # Watch mode for type checking
bun run format       # Format with Biome
bun run lint         # Lint and fix with Biome
```

## Architecture

### Tech Stack
- **Framework**: SvelteKit 3.x with Svelte 5 runes (`$state`, `$derived`, `$effect`)
- **Styling**: UnoCSS with Tailwind v4 preset
- **Build**: Vite 8.x, TypeScript 6.x
- **Runtime**: Bun 1.x / Node 24.x
- **Deployment**: Vercel (adapter-vercel), config in `vercel.ts`
- **Env vars**: varlock (`.env.schema` + `varlock/env` import)
- **Monitoring**: Sentry 11 (errors), Plausible (analytics). Sentry 11
  replaced `sendDefaultPii` with `dataCollection` and turned user info,
  cookies, headers, request/response bodies and GenAI inputs/outputs ON by
  default. `src/instrumentation.server.ts` pins the pre-upgrade baseline
  (all of that off) so the prompts and completions flowing through
  `/api/concierge` and `/api/transcribe` are not shipped to Sentry. This is
  a deliberate divergence from slx-web, which inherits the new defaults.
  Source maps upload only from Vercel builds (`VERCEL=1`).

### Content System
Two content sources:

**Replicator CMS** (the `replicator` repo's org-scoped public API at
`https://replicator.lj.dev`, Lightning Jar org). Fetched at request time
by server-rendered routes with edge caching — saving in the replicator
editor goes live without a redeploy:
- **Blog posts**: collection `blog`, LJ default blog entity
  (`getBlogArticles.ts`, `BLOG_API_KEY`). The pre-migration `.md`
  corpus lives on only as a FROZEN parser-characterization fixture at
  `tests/fixtures/blog-corpus/` (feeds `tests/blogCorpus.test.ts`) —
  it is not content and must not gain new posts.
- **Customer stories**: collection `customer-story`, Customer Stories
  blog entity (`getCustomerStories.ts`, `CUSTOMER_STORIES_API_KEY`).
  Prose lives in the markdown body; banner/testimonials/perspectives/
  images/etc. ride in frontmatter.
- **Reading list**: collection `reading-list`, Reading List blog entity
  (`getReadingList.ts`, `READING_LIST_API_KEY`). Entries are pure
  frontmatter (`Article` shape) with EMPTY markdown bodies — edited via
  the replicator editor's frontmatter/JSON surfaces. Each entry has a
  detail page at `/reading-list/[slug]` (summary + outbound link);
  internal links should target those, not the source URL.
- **Findings**: collection `findings`, Findings blog entity
  (`getFindings.ts`, `FINDINGS_API_KEY`). Short numbered field notes
  (`Finding` shape: number/area/project/verified/environment in
  frontmatter, prose in the markdown body) at `/findings` and
  `/findings/[slug]`. Until the entity + key exist, every getter
  degrades to empty (keys not starting with `blogk_` are ignored), so
  the surface is safe to deploy pre-mint.
- Markdown from the CMS is parsed locally by `parseMarkdown()` so
  rendering stays under this repo's control. Draft previews:
  `/blog/preview/[token]` (client-rendered, token-authed, works for
  prose-bodied collections).

**Git** (loaded via getters in `src/lib/content/getters/` using
`import.meta.glob()`):
- **Landing pages**: JSON files in `src/lib/content/landing-pages/`
- **Technologies**: JSON in `src/lib/content/technologies/`, grouped by `supercategory` (defined in `src/lib/content/technologySuperCategories/`)

### Imports (`#lib`)
No custom path aliases (SvelteKit 3 deprecated `config.alias`). Everything
under `src/lib` is reached through the Node subpath import declared in
`package.json` `imports`, which Vite, TypeScript and Bun all resolve
natively (same convention as slx-web):

- Use explicit extensions: `#lib/utils/slugify.js` for `.ts` modules,
  `#lib/components/Foo.svelte`, `#lib/data/footer.json`.
- Asset queries pass through: `#lib/assets/icon.svg?raw`.
- The mapping is two entries, and the order matters:
  ```json
  "#lib/*.js": ["./src/lib/*.ts", "./src/lib/*.js"],
  "#lib/*": "./src/lib/*"
  ```
  The first exists because Bun does not apply TypeScript's `.js` -> `.ts`
  rewrite inside subpath imports; without the fallback array every
  `#lib/**.js` import fails under `bun test` (Vite resolves it either way).

### Data Flow
```
Content (JSON/MD) → Getters → +page.server.ts (load) → +page.svelte → Browser
```

Pages use SvelteKit's `+page.server.ts` for server-side data loading. Most pages are prerendered (`export const prerender = true`).

### UnoCSS Shortcuts
Common utility shortcuts defined in `uno.config.ts`:
- `display` - Main page headings (Bungee Shade font, yellow)
- `heading-2` - Section headings
- `button` / `button-accent` - Button styles
- `page-x-padding` - Responsive horizontal padding
- `main-y-padding` - Responsive vertical padding
- `body-article` / `blog-article` - Article prose styling

### Brand Colors
- `oxford` / `oxfordBlue` - Dark blue background (hsl 217, 48%, 15%)
- `maximumYellow` / `accent` - Primary accent (#ebf92f)
- `cornflower` - Secondary blue
- `cultured` - Light gray/white

### Key Components
- `GlobalNav.svelte` - Site navigation with hamburger menu (uses popover API)
- `GlobalFooter.svelte` - Footer with contact info and links
- `LightningButton.svelte` - Branded CTA button with lightning bolt animation

## Editorial Style

Blog copy follows house rules: no em/en dashes in prose, plain phrasing over clever fragments. Before publishing an article, scan it against `docs/ai-writing-tells.md` (pattern file: `docs/ai-writing-tells.grep`) and review every hit in context.

## Code Style

- **Formatting**: Biome with tabs, double quotes, trailing commas. Biome 2.6
  added markdown, YAML and SVG formatters; the markdown formatter is turned
  off (`markdown.formatter.enabled: false`, as in slx-web) because prose
  follows the house editorial rules and `tests/fixtures/blog-corpus` is a
  frozen corpus whose bytes must not drift. SVGs (committed assets) and
  `ops/swamp/vaults` (generated) are excluded in `files.includes`. Do not
  re-enable these without a deliberate, separate reformat commit.
- **Imports**: Organized by Biome with specific grouping (SvelteKit first,
  then external libs, then `#lib/...` groups). `bun run format` does NOT
  apply import grouping: it is an assist, so it needs
  `bunx biome check --write`.
- **Dependency pins**: core framework and toolchain packages (kit, svelte,
  vite, vite-plugin-svelte, adapter-vercel, svelte-check, unocss, biome,
  sentry, varlock trio, @vercel/config, yaml, mcp-handler) are pinned
  exactly so upgrades are deliberate commits; leaf libraries keep carets.
  Same policy as slx-web.
- **Types**: Strict TypeScript; type definitions in `src/lib/types/`
- **Svelte**: Runes mode only (`$state`, `$derived`, `$effect` instead of stores)

## Testing

Tests use Bun's built-in test runner with Happy DOM for DOM simulation:
```bash
bun test                    # Run all tests
bun test tests/slugify.test.ts  # Run single test file
```

## Environment Variables

Env vars are managed by **varlock**, not SvelteKit's `$env/*`. Source of truth is `.env.schema` (committed) with decorators like `@required`, `@sensitive`, `@type`, `@example`.

- **Reading vars**: `import { ENV } from "varlock/env"` then `ENV.VAR_NAME`. Do not use `$env/static/private`, `process.env.*`, or `import.meta.env.*`.
- **Adding a var**: add it to `.env.schema` with decorators, set its value in `.env.local` (gitignored) for dev or in Vercel for deploys.
- **Types**: `src/env.d.ts` is auto-generated by `varlock codegen` (wired into `prepare` / `check`) and gitignored.
- **Vite plugin order**: `varlockVitePlugin()` must come before `sentrySvelteKit()` and `sveltekit()` in `vite.config.ts`.

## Deployment

Deployed to Vercel. Configuration in `vercel.ts` (typed via `@vercel/config`) includes:
- CSP headers for security
- 301 redirects for legacy URLs
- No trailing slashes
- Build/install commands and output directory

Server runtime pinned to `nodejs24.x` via the adapter's `runtime` option in
`vite.config.ts`. Do not move this to a `config` export in
`src/hooks.server.ts`: adapters only read `config` from route files, so a
hooks export is silently ignored and the runtime falls back to whatever Node
version ran the build.
