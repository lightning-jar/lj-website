---
title: "Utility CSS for Markup That Doesn't Exist Yet"
metaTitle: "Utility CSS for LLM-Generated Markup | Lightning Jar Engineering"
slug: utility-css-for-markup-that-doesnt-exist-yet
description: "Utility CSS toolchains assume your markup exists at build time. In an AI product it doesn't: Replicator's documents are authored by a language model and stored in blob storage, so the build-time scanner has never seen a single class our customers actually look at. Here is how we run one UnoCSS config as two compilers, one at build time for the app and one in the browser for the documents, how a palette made of formulas lets utility classes re-skin per brand without a rebuild, and the three scars that taught us where the sharp edges are."
date: 2026-07-01T18:00:00Z
draft: false
tags: [ai, css, unocss, design-systems, replicator]
image: https://lj-01.nyc3.cdn.digitaloceanspaces.com/images/blog/painter.webp
imageDescription: A watercolor painting of a teddy bear holding a paintbrush, seated beside an easel and a palette of paints
author: Kevin Peckham
quote:
  text: "The classes our customers actually see were written by a language model after the build finished. Our CSS pipeline has never seen a single one of them."
  attribution: Kevin Peckham, Principal at Lightning Jar
glossary:
  - term: Utility class
    definition: A small single-purpose CSS class like bg-primary-500 or px-4, composed in markup instead of written as bespoke stylesheet rules, so styling decisions live on the element that uses them.
  - term: Static extraction
    definition: The build step where a utility CSS tool scans your source files for class names and emits only the rules those names require, which keeps the shipped stylesheet small but assumes every class the product will ever render is visible in the repo at build time.
  - term: Runtime engine
    definition: The same class-to-CSS generator running in the browser, watching the DOM for class names as they appear and injecting the matching rules on the fly, which is what makes utility classes work on markup created after the build.
  - term: OKLCH
    definition: A perceptually uniform color space with lightness, chroma, and hue channels, which makes programmatic color scales behave predictably in a way RGB and HSL do not.
  - term: Channel sub-variables
    definition: Storing a color as three CSS variables (lightness, chroma, hue) instead of one resolved value, so downstream rules can recompose the channels into new shades with calc() at render time.
additionalReading:
  - title: "AST as HTML: A Native Data Format for LLMs"
    url: "/blog/ast-as-html"
  - title: "The Content Overlay: Where the Words Live"
    url: "/blog/content-overlay"
  - title: "UnoCSS: the instant on-demand atomic CSS engine"
    url: "https://unocss.dev"
  - title: "barkup on GitHub: the codec our documents round-trip through"
    url: "https://github.com/kevinpeckham/barkup"
---

***Series note:*** *Part of our Replicator engineering series, alongside [AST as HTML](/blog/ast-as-html) and [the content overlay](/blog/content-overlay). Those posts covered how a language model authors a document's structure and content. This one covers how it authors appearance without owning the design system.*

Utility CSS rests on a quiet contract. You write classes like `px-4` and `bg-primary-500` in your markup, and at build time a scanner reads your source files, collects every class name it finds, and emits exactly the rules those names require. Nothing more ships. The whole ecosystem, the tiny production stylesheets, the tree-shaking, the purge step, is built on one assumption: the markup is in the repo.

Ours isn't.

Replicator is an AI brand operating system: a language model designs marketing documents inside brand-approved rails, and humans finish them in an editor. The documents live in blob storage as data. The classes on their elements were chosen by the model, or by a person clicking in an editor, at runtime, months after the last deploy. The build-time scanner has never seen a single class our customers actually look at.

## Three ways out, two of them bad

Once your markup is created after the build, you have three options.

**Safelist the universe.** Tell the build to emit every class anyone might ever use. For a real utility vocabulary (every color at every shade, every spacing step, every variant prefix) that's the combinatorial explosion the scanner exists to prevent. You ship megabytes to style a page that uses forty rules.

**Inline styles.** Have the model write `style="padding: 1rem"` instead. Now there's no vocabulary to constrain, no design tokens, and no way to express `hover:` states or responsive breakpoints at all, because inline styles can't carry pseudo-classes or media queries. You also lose the thing that made classes attractive in the first place: a model that writes `bg-primary-500` is picking from your palette; a model that writes `style="background: #3b82f6"` is picking from its imagination.

**Run the compiler in the browser.** Ship the class-to-CSS engine itself, let it watch the DOM, and generate rules as class names appear. This is the one that works, and it's why we build on [UnoCSS](https://unocss.dev): it's architected as an engine first, and its runtime package is a supported way to run that engine client-side. (Tailwind 4 has a browser build too, but it's the Play CDN, which the docs position for development and prototyping; the production path is compiled. That's a reasonable scope choice on their part. It just isn't our problem shape. UnoCSS's `presetWind4` gives us the Tailwind-compatible vocabulary with a runtime that's a first-class citizen.)

## One config, two compilers

So the same design system compiles twice.

The app itself, the chrome, the dashboards, the editors' own UI, is normal: UnoCSS runs as a Vite plugin at build time, scans the Svelte source, and ships a small static stylesheet. But six routes also boot the engine in the browser: the two editors where documents are assembled, and four bare preview routes whose only job is to render a document, widget, or page with no UI around it. Each of those routes has a layout that does, in essence, this:

```ts
import initUnocssRuntime, { defineConfig } from "@unocss/runtime";
import presetWind4 from "@unocss/preset-wind4";

initUnocssRuntime({
  defaults: defineConfig({
    // the build already shipped a reset; don't stomp it
    presets: [presetWind4({ preflights: { reset: false } })],
    shortcuts,                    // shared with the build config
    theme: { colors: { ...systemColors, ...themeColors } },
  }),
});
```

The engine watches the document and generates CSS for whatever class names show up, including ones that arrive mid-session because the model just wrote them into a draft. Our styles directory is split to serve both compilers: `system-*` modules feed the build, `runtime-*` modules feed the browser, and the vocabulary (shortcuts, color scales, type styles) is shared so a class means the same thing in both worlds.

One line up there earns its comment. The build-time pass already ships a CSS reset; if the runtime engine applies its own preflight reset on top, it re-fights the cascade against your global styles. `reset: false` on the runtime side is the difference between the two compilers cooperating and quietly overwriting each other.

## Why let a model write classes at all

Because it's the dialect the model already speaks. Our documents are typed trees authored in [an HTML dialect](/blog/ast-as-html), and utility classes are massively represented in the corpora these models trained on. Ask a model for "a card with generous padding and the brand's primary background" and Tailwind-shaped vocabulary is what it reaches for unprompted. Giving it that vocabulary, constrained to our token set, is a prompt-engineering decision as much as a styling one: the model composes from a menu it knows, and the menu is ours.

The interesting consequence: the class is static, but its meaning isn't.

## The palette is a formula

`bg-theme-primary-500` never changes. What changes is what `primary` means, because in Replicator every organization has a versioned theme, stored as data, that resolves to CSS variables at render time. Rebrand the org and every document it ever produced re-skins on next load, without touching a single class.

The mechanism is the part I'd want another engineer to steal. Each theme color is stored as three channel variables, lightness, chroma, and hue in OKLCH. The eleven-shade scale the utility classes address is not a generated palette sitting in a file anywhere; it's a formula, baked into the UnoCSS theme once:

```ts
for (const shade of shades) {
  const l = (1000 - shade) / 1000;
  const factor = Math.sin((Math.PI * shade) / 1000) ** 0.7;
  scale[shade] = `oklch(${l} calc(var(--theme-color-${name}-c) * ${factor}) var(--theme-color-${name}-h))`;
}
```

Every shade of every theme color is one `oklch()` expression over the channel variables, with lightness stepping linearly and chroma tapering on a sine curve so the extremes desaturate the way good palettes do. Change three CSS variables and all eleven shades of that color re-derive in the browser, instantly, for every class that references them. There is no palette build step because there is no palette, only the formula.

It has a failure mode worth naming, because it cost us a debugging afternoon: if a theme is missing the channel sub-variables, the whole `oklch()` expression is invalid, and CSS falls back to `currentcolor` for text and transparent for backgrounds. The symptom is "some classes apply and others silently vanish," which looks exactly like a scanning bug and is actually a data bug. Our fix was to normalize every color to canonical OKLCH at theme-save time (hex, rgb, and named colors all accepted in, one shape stored), with a render-time fallback as the migration cushion for themes saved before the rule existed.

## Even the screenshots depend on the browser

One dependency surprised us when we drew the diagram: the *server-side* thumbnail pipeline runs on the *client-side* CSS engine. Document, widget, and page thumbnails are made by pointing a headless browser at those bare preview routes and screenshotting them, and those routes style their content the same way every visitor's browser does, by running the UnoCSS engine at load. There is no server-rendered stylesheet to fall back on. The screenshot service is just another browser.

Runtime CSS also arrives after first paint, which means these routes would flash unstyled content on every load. The gate we landed on: wait for `document.fonts.ready`, then one animation frame (which is when the engine has scanned the initial DOM and injected its sheet), then a 150ms settle for the reflow the late styles trigger. Until then, a spinner overlay with a solid background sits on top. Solid, not translucent: an opacity veil would let the flash ghost through, and the entire point of the gate is that nobody ever sees the intermediate state. The honest trade-off is the 150ms tail, a fixed budget chosen because the runtime engine exposes no clean "all styles applied" signal to wait on.

## Three scars

Architecture posts that skip the incidents are advertising. Here are ours.

**The scanner reads your comments.** UnoCSS's build-time extractor doesn't parse your code; it pattern-matches class-shaped strings anywhere in source, including JSDoc. We once documented a class format in a doc comment, with a `{slug}` placeholder in the middle of it, and the scanner extracted the literal, emitted CSS with a raw `{slug}` inside a `var()`, and the production build died in the minifier with `Unexpected token CurlyBracketBlock`. Typechecking passed. Lint passed. Only `build` caught it, because only `build` runs the scanner. The rule since: class literals never appear in comments, and the class of bug got a named warning comment at the site that produced it.

**Two compilers, two namespaces, one silent no-op.** The runtime registers theme colors under a `theme-` prefix, so the day we wrote `bg-primary` into a document expecting the runtime theme to resolve it, it resolved to nothing. Not an error: nothing. The old class was stripped, the new class matched no rule, and the background just didn't change. The durable fix was to stop depending on theme namespace resolution for stored data entirely and write the arbitrary-value form, `bg-[var(--theme-color-primary)]`, which binds the class directly to the variable contract rather than to either compiler's configuration. Stored markup now depends on the narrowest interface available.

**A partial scaffold renders "something."** Every surface that renders document content needs the full runtime bundle: the engine, the base typography CSS, the variable preflight, the shortcuts. Three times in six months, a new surface (a preview route, an editor pane) launched with most of that scaffold, and the result was the worst kind of failure: the content rendered, mostly, so the missing 20% of styling read as a content bug or a data bug, and we debugged in the wrong layer. A hard 404 would have been kinder. The countermeasure is boring and effective: the scaffold is a documented checklist, and "renders AST content" now means "imports the whole bundle," not "imports what this page seems to need."

## The general rule

None of this is Replicator-specific. If your product renders markup that's created after build time, LLM-generated, CMS-stored, or user-authored, the static-extraction contract is already broken for you; the only question is which patch you're on. Safelisting works if your dynamic vocabulary is genuinely tiny. Generating CSS server-side at save time works if you can tolerate stale styles when the design system moves. Inline styles work if you don't need states, breakpoints, or tokens, which is to say they don't.

We wanted the whole vocabulary, live theming, and one definition of what every class means. That's the compiler-in-two-places pattern: one config, compiled ahead of time for the markup you have, and again in the browser for the markup you don't have yet. The model writes the classes. The org owns the colors. And the build pipeline, which has never seen either, ships small anyway.
