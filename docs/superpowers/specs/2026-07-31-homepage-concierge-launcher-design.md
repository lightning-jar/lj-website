# Homepage Concierge Launcher — Design Spec

**Date:** 2026-07-31
**Status:** Approved in brainstorming (placement, scope, and positioning
chosen by Kevin). Dev-only: no push to production until explicitly ready.

## Goal

Put the concierge chat on the homepage as a floating bottom-right
launcher that opens a panel wrapping the existing `ConciergeChat`
component. Homepage only; the `/concierge` page remains the full-page
experience.

## Decisions (from brainstorming)

- **Placement:** floating launcher bubble, not a hero embed or a
  dedicated row.
- **Scope:** homepage only, rendered from `src/routes/+page.svelte`.
  Site-wide later = move one line into the layout.
- **Corner:** launcher takes `fixed bottom-5 right-5 z-50`; on the
  homepage `BackToTop` does not render (all other pages unchanged).
- **No auto-open, ever.** The panel opens only on click — human-origin
  gesture, per the CCRTA maps-sprint evidence that human-origin gating
  is the effective abuse/cost fence.

## Components

### `src/lib/components/ConciergeLauncher.svelte` (new)

- Round branded ⚡ button, `fixed bottom-5 right-5 z-50`, with
  `aria-expanded`, `aria-controls`, visible focus ring, and an
  accessible name ("Ask the concierge").
- Panel anchored above the button: `w-[min(420px,calc(100vw-2rem))]`,
  `h-[min(640px,85dvh)]`, oxford card styling (`bg-oxford`,
  `border border-white/14`, rounded, shadow), containing
  `<ConciergeChat />` with internal scroll.
- Panel mounts on first open and afterwards hides via class (not
  unmount): conversation, input text, and the lazily-loaded AI SDK
  survive close/reopen within the visit.
- Open moves focus into the panel (its heading or the chat input);
  close returns focus to the button; `Escape` closes. Transitions
  respect `prefers-reduced-motion`.

### Wiring

- `src/routes/+page.svelte`: render `<ConciergeLauncher />`.
- `src/routes/+layout.svelte`: skip `<BackToTop />` when
  `page.url.pathname === "/"`.
- `ConciergeChat.svelte`: reused as-is. Its gesture-gated hydration
  (SDK loads only on focus/pointer/touch of the card) is preserved
  inside the panel. Visual compact tweaks only if dev reveals the need.

## Verification

- axe scan: homepage with panel closed and open — no new violations.
- Playwright: zero AI/SDK network requests before a human gesture
  (re-proving the lazy-hydration guarantee in the new placement).
- Keyboard: Tab to launcher, Enter opens, Escape closes, focus returns.
- No CLS from the fixed launcher; `bun run check` + `bun test` green;
  Biome clean.
- BackToTop still renders on non-homepage routes.

## Non-goals (v1)

Site-wide rollout; Plausible open-event; changes to `ConciergeChat`
internals, the `/concierge` page, or any backend (rate limits just
shipped); unread badges or attention animations.
