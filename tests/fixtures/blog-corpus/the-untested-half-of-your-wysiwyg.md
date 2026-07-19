---
title: "The Untested Half of Your WYSIWYG"
metaTitle: "barkdown: a Markdown to DOM Round-Trip Codec | Lightning Jar Engineering"
slug: the-untested-half-of-your-wysiwyg
description: "Markdown to HTML is a solved problem. The way back, DOM to markdown, is where WYSIWYG editors quietly eat documents: fences that grow a blank line per save, lists that renumber themselves, footnotes that vanish a trip late. We extracted our blog editor's serializer into @kevinpeckham/barkdown, an open-source codec whose contract is a mathematical property you can test: one round trip canonicalizes any input, and a second trip is byte-identical. Here is what the contract buys, what a fuzzer found on the way to the first release, and why the fix that landed sixteen minutes before the release commit is the whole thesis in one URL."
date: 2026-07-08T21:00:00Z
draft: false
tags: [markdown, open-source, wysiwyg, codecs, replicator]
image: https://lj-01.nyc3.cdn.digitaloceanspaces.com/images/blog/cinnamon-bark.webp
imageDescription: A watercolor painting of a bundle of cinnamon bark sticks tied with a ribbon
author: Kevin Peckham
quote:
  text: "Everyone tests the markdown-to-HTML direction. The way back is where your editor eats a document one save at a time."
  attribution: Kevin Peckham, Principal at Lightning Jar
glossary:
  - term: Round-trip codec
    definition: A pair of translators between two formats that are tested as a pair, so a document converted one way and back is guaranteed to survive, rather than two independent converters that happen to point in opposite directions.
  - term: Fixed point
    definition: An input a function maps to itself. A serializer whose serialize-then-parse cycle is a fixed point can be applied any number of times without the document drifting, which is the property a WYSIWYG editor needs and almost never tests for.
  - term: Canonical dialect
    definition: The one normalized markdown shape a round-trip codec emits (ATX headings, dash bullets, fenced code), so that every representable document has exactly one serialization and byte-equality becomes a meaningful test.
  - term: Property-based testing
    definition: Testing a rule against thousands of generated random inputs instead of a handful of hand-picked examples, so the suite hunts for counterexamples in corners no human would think to write down.
  - term: contenteditable
    definition: The browser attribute that turns any element into a rich-text editing surface, giving you a live DOM the user mutates directly, which is exactly why the DOM-to-markdown direction has to be trustworthy.
additionalReading:
  - title: "AST as HTML: A Native Data Format for LLMs"
    url: "/blog/ast-as-html"
  - title: "Content Is an Overlay: Separating Words from Structure in an AI Document Editor"
    url: "/blog/content-overlay"
  - title: "barkup 0.2: We Shipped What the Benchmark Told Us"
    url: "/blog/barkup-0-2-anchored-patches"
  - title: "@kevinpeckham/barkdown on npm"
    url: "https://www.npmjs.com/package/@kevinpeckham/barkdown"
  - title: "barkdown on GitHub"
    url: "https://github.com/kevinpeckham/barkdown"
---

***Series note:*** *Part of our engineering series on codecs for the editing era, alongside [AST as HTML](/blog/ast-as-html) and [the barkup release post](/blog/barkup-0-2-anchored-patches). Those covered structured design trees. This one is about prose.*

Every markdown WYSIWYG is two translators wearing one trench coat. The famous half, markdown to HTML, is a solved problem: we use [marked](https://github.com/markedjs/marked), like half the internet, and it's been hardened by a decade of production abuse. The other half, walking the edited DOM back into markdown, is usually a bespoke function somebody wrote on a deadline, tested against the six documents that existed that week.

And it's the half that owns your data. In an editor built on `contenteditable`, the DOM is the live document; the markdown you store is whatever the serializer says it is. Ship a subtle bug there and nothing crashes. The document just comes back slightly different than it went in, every save, forever.

We know exactly what that looks like, because we extracted our serializer from a production system, Replicator's blog CMS, where every keystroke round-trips through this exact pair of functions. This week we published it as [`@kevinpeckham/barkdown`](https://www.npmjs.com/package/@kevinpeckham/barkdown): an open-source markdown-to-DOM round-trip codec, guaranteed to invert marked.

## What drift actually looks like

The failure mode of a hand-rolled serializer isn't a crash. It's *drift*: output that the parser reads back differently, so each edit-save cycle moves the document a little further from itself. When we ported our production serializer into the package and pointed a proper test corpus at it, the drift bugs it had been quietly carrying were exactly this flavor:

- Code fences grew a blank line per cycle, because marked emits a trailing newline inside `<code>` that the walker faithfully preserved into a new line of content.
- Ordered lists starting at 7 silently renumbered from 1, because nobody had ever serialized the `start` attribute back out.
- GFM task-list checkboxes vanished, because the checkbox is an `<input>` element the inline walker didn't recognize, and unknown elements were being unwrapped.

The root cause was one sentence in the fix commit: the walker inverted *the editor's* dialect but not *marked's own output*. It could read back what the WYSIWYG produced, and choked on what the parser produced. Two translators, never tested as a pair.

## The contract

barkdown's answer is to make the pairing itself the product. The package ships four guarantees, and the second is the one that matters:

1. **Canonical identity.** For markdown already in the canonical dialect, `toMarkdown(toDom(md))` is the input, byte for byte.
2. **Fixed-point convergence.** For *any* input markdown, one round trip reaches the canonical form, and a second round trip is byte-identical to the first. Serialize-then-parse is idempotent: apply it once or a thousand times, same document.
3. **Footnote identity.** marked-footnote's exact DOM shape (the `footnote-N` ids, the back-reference links, the `data-footnotes` section) round-trips precisely, including non-numeric labels.
4. **No silent loss.** Unknown elements pass through as raw HTML, which markdown preserves stably, and every DOM text node reaches the output.

Guarantee 2 is why the package exists, and holding it forces design decisions that look eccentric until you see the failure they prevent. Adjacent same-marker lists are held apart by an HTML comment, because a blank line alone would merge them on re-parse. Bare URLs in plain text get defused with an escape, because marked linkifies them anywhere and a linkified URL is a different DOM. Footnote definitions that nothing references get dropped *now*, at serialize time, because marked-footnote renders them to nothing and they'd silently vanish a trip late otherwise; an honest loss you can see beats a deferred one you can't. And emphasis that markdown genuinely cannot express (marked's pairing rules have real corners, including CommonMark's "rule of three") serializes as raw inline tags around escaped content, which re-parses to the identical DOM. When the dialect can't say it, the codec says so in HTML rather than saying something almost right in markdown.

## What the fuzzer found on the way out the door

Hand-picked test cases can't defend a fixed-point claim, because the whole point is the inputs you didn't think of. So alongside a fixture corpus, the suite runs property tests: about 2,000 generated documents per run, drawn from arbitrary strings, unicode soup, and a markdown-syntax generator, all checked against the rule `roundTrip(roundTrip(s)) === roundTrip(s)`.

The property suite earned its keep the same evening the package shipped. Its counterexample was one URL:

```
https://example.com#&#169;word
```

The mechanism is a three-cushion bank shot. marked's GFM tokenizer leaves the character entity raw in the `href` attribute, but the DOM *decodes* it. So on the first trip the serializer sees link text equal to link destination and emits the tidy bare-autolink form. Re-parsing that bare text runs the URL through marked's `cleanUrl`, which is `encodeURI`, which percent-encodes the character, and now the second trip's output differs from the first. Idempotence broken by one copyright sign in a fragment.

The fix is the thesis in miniature: a URL may serialize in the bare form only if it is itself a *fixed point* of `cleanUrl`. URLs that would change under encoding canonicalize once into the full link form, readable text with an encoded destination, which is byte-stable forever after. That commit landed sixteen minutes before the release commit, caught not by a reviewer but by a generator throwing unicode at an invariant. The publish gate runs the same suite, so the counterexample could not have shipped even if nobody had been watching.

## The honest edges

Three things worth knowing before you adopt it.

**The canonical dialect is opinionated.** ATX headings, dash bullets, tight lists, fenced code. That's what makes byte-equality a meaningful test: every representable document has exactly one serialization. The practical consequence: the first time you edit a legacy document, its markdown source may reformat (setext headings become ATX, asterisk bullets become dashes) even though the rendered document is identical. We watched this in production when Replicator's blog editor swapped its local serializer for the package, and it's a one-time normalization, not drift, but your git diffs should expect it.

**The guarantees are enforced, not proven.** A fixture corpus, adapter-conformance runs against two server-side DOM implementations, and the property suites: 274 tests and about 2,530 assertions, with the random suites at roughly 2,000 documents per run. That's a strong empirical fence around the contract, and we say "enforced by test" rather than pretending it's a theorem.

**You own marked's version.** `marked` and `marked-footnote` are peer dependencies, and the guarantee is stated against them: barkdown models marked's actual parsing behavior, including its documented-by-test deviations from CommonMark, so the version policy in the README says which range the contract is tested against. A codec that inverts a parser is coupled to that parser; pretending otherwise would be the silent-drift bug at the ecosystem level.

One more disclosure, because it's the kind we'd want from others: a large share of the implementation was executed by a coding agent working inside this test harness, and the package went from scaffold to release in a single nine-hour day. The reason that was safe is the same reason the package is trustworthy at all: the contract is machine-checkable. A crisp invariant plus a fuzzer is what makes delegation possible, whether you're delegating to a colleague or to a model, and the counterexample above is the harness doing precisely the job the reviewer can't.

## The sibling

If you've read [AST as HTML](/blog/ast-as-html), the shape of this will be familiar, because barkdown is the second half of a pair. [barkup](https://github.com/kevinpeckham/barkup) guards a design tree's identity: typed nodes, stable ids, round trips through an HTML dialect. barkdown guards the prose's: markdown in, live DOM out, markdown back, byte for byte. One philosophy, two boundaries: wherever a document crosses between a storage format and an editing surface, the crossing should be a codec with a contract, not two functions that happen to point in opposite directions.

```bash
npm install @kevinpeckham/barkdown marked marked-footnote
```

MIT licensed, [on npm](https://www.npmjs.com/package/@kevinpeckham/barkdown) with provenance, source and the full test suite [on GitHub](https://github.com/kevinpeckham/barkdown).
