# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lightning Jar website - a static-first, content-driven marketing site built with SvelteKit 2.x and Svelte 5 (runes mode).

## Commands

```bash
bun dev              # Start dev server (localhost:5173)
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
- **Framework**: SvelteKit 2.x with Svelte 5 runes (`$state`, `$derived`, `$effect`)
- **Styling**: UnoCSS with Tailwind v4 preset
- **Build**: Vite 8.x, TypeScript 6.x
- **Runtime**: Bun 1.x / Node 24.x
- **Deployment**: Vercel (adapter-vercel), config in `vercel.ts`
- **Env vars**: varlock (`.env.schema` + `varlock/env` import)
- **Monitoring**: Sentry (errors), Plausible (analytics)

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
- Markdown from the CMS is parsed locally by `parseMarkdown()` so
  rendering stays under this repo's control. Draft previews:
  `/blog/preview/[token]` (client-rendered, token-authed, works for both
  collections' bodies).

**Git** (loaded via getters in `src/lib/content/getters/` using
`import.meta.glob()`):
- **Landing pages**: JSON files in `src/lib/content/landing-pages/`
- **Reading list**: `Article`-shaped JSON in `src/lib/content/reading-list/` (title, author, source, summary, excerpt, tags, url)
- **Technologies**: JSON in `src/lib/content/technologies/`, grouped by `supercategory` (defined in `src/lib/content/technologySuperCategories/`)

### Path Aliases
```
$components → src/lib/components
$content    → src/lib/content
$types      → src/lib/types
$utils      → src/lib/utils
$assets     → src/lib/assets
$data       → src/lib/data
$settings   → src/lib/settings
```

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

## Code Style

- **Formatting**: Biome with tabs, double quotes, trailing commas
- **Imports**: Organized by Biome with specific grouping (SvelteKit first, then external libs, then internal aliases)
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
- **Types**: `src/env.d.ts` is auto-generated by `varlock typegen` (wired into `prepare` / `check`) and gitignored.
- **Vite plugin order**: `varlockVitePlugin()` must come before `sentrySvelteKit()` and `sveltekit()` in `vite.config.ts`.

## Deployment

Deployed to Vercel. Configuration in `vercel.ts` (typed via `@vercel/config`) includes:
- CSP headers for security
- 301 redirects for legacy URLs
- No trailing slashes
- Build/install commands and output directory

Server runtime pinned to `nodejs24.x` in `src/hooks.server.ts` via the `config` export.
