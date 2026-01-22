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
- **Build**: Vite 7.x, TypeScript 5.9
- **Runtime**: Bun 1.x / Node 24.x
- **Deployment**: Vercel (adapter-vercel)
- **Monitoring**: Sentry (errors), Plausible (analytics)

### Content System
All content is stored in git (no database):
- **Blog posts**: Markdown files in `src/lib/content/blog/` with YAML frontmatter
- **Landing pages**: JSON files in `src/lib/content/landing-pages/`
- **Customer stories**: JSON in `src/lib/content/customer-stories/`

Content is loaded via getter functions in `src/lib/content/getters/` using `import.meta.glob()`. A custom `parseMarkdown()` utility handles frontmatter extraction and HTML conversion.

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

## Deployment

Deployed to Vercel. Configuration in `vercel.json` includes:
- CSP headers for security
- 301 redirects for legacy URLs
- No trailing slashes
