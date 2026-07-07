---
title: "barkup 0.2: We Shipped What the Benchmark Told Us"
metaTitle: "barkup 0.2 | Id-Anchored Patches"
slug: barkup-0-2-anchored-patches
description: "Our benchmark found that id-anchored patches match whole-tree rewrite's reliability at the lowest cost of any condition we measured. So barkup 0.2 ships them: an optional patch utility that addresses nodes by id, never by position, riding on the id stability the codec already guarantees."
date: 2026-07-06T12:00:00Z
draft: false
tags: [ai, agents, llm, open-source, barkup]
image: https://lj-01.nyc3.cdn.digitaloceanspaces.com/images/blog/dog.webp
imageDescription: A watercolor painting of a terrier puppy
author: Kevin Peckham
quote:
  text: "We made a claim, we tested it honestly, and we shipped what the data told us. That third step is the one most benchmarks skip."
  attribution: Kevin Peckham, Principal at Lightning Jar
glossary:
  - term: Anchored patch
    definition: "A list of edit operations that address nodes by id, with insert and move placements anchored to sibling ids (before, after, or parentId), never by positional path."
  - term: RFC 6902 (JSON Patch)
    definition: The standard JSON patch format, which addresses nodes by index-based paths. It is the approach anchored patches replace, and the one that collapsed on large trees in our benchmark.
  - term: Id preservation
    definition: barkup's first guarantee, that node ids survive parse, build, and format byte-for-byte. It is the single precondition anchored patches depend on.
  - term: Atomic patch
    definition: A patch that is applied all-or-nothing, so a single failing operation rejects the whole patch and leaves the input tree untouched.
additionalReading:
  - title: "We Benchmarked It: What Held Up in 'HTML as a Native Data Format for LLMs', and What Didn't"
    url: "/blog/barkup-bench-results"
  - title: "One Hidden Default Broke My Benchmark (and Maybe Your Agent)"
    url: "/blog/tool-history-footgun"
  - title: "HTML as a Native Data Format for LLMs: Why We Encode Our Data in Markup Instead of JSON"
    url: "/blog/ast-as-html"
  - title: "Content Is an Overlay: Separating Words from Structure in an AI Document Editor"
    url: "/blog/content-overlay"
---

This is the third step of a loop we don't usually get to finish in public. We made a claim: [typed trees should be authored as HTML and edited by whole-tree rewrite](/blog/ast-as-html). We tested it, [pre-registered and honestly, and published the mixed results](/blog/barkup-bench-results). And now we've shipped the part the data was most excited about. [barkup](https://github.com/kevinpeckham/barkup) 0.2 adds **id-anchored patches** as an optional utility, driven directly by the benchmark, not by a hunch.

## What the data said

The benchmark ran a pre-registered sixth condition after the main study: a patch dialect whose operations address nodes exclusively by id, with placements anchored to sibling ids rather than positions. It was the standout result. Anchored patches tied whole-tree rewrite on task success (92.6% vs 91.9%, p = 0.53), fully recovered the large-tree collapse that sank standard RFC 6902 JSON Patch (85.1% vs 69.6% at about 150 nodes, p < 0.0001), and did it as the cheapest condition at every tree size (13.2k tokens per solved 150-node task, 16% under rewrite).

***Update (July 2026):*** *barkup-bench later published a protocol correction affecting its granular-tools results. The anchored-patch numbers cited here ran on protocols the defect never touched and are unchanged; see the [correction in the benchmark repo](https://github.com/kevinpeckham/barkup-bench) and the [corrected results post](/blog/barkup-bench-results).*

That is a rare shape for a result: as reliable as the best strategy, at the lowest cost. We originally read a third virtue into it (strong performance on smaller models where the alternatives degraded), but the benchmark's correction showed that small-model fragility in the granular-tools conditions was a harness artifact, not a property of the tools. What genuinely degraded is positional RFC 6902 JSON Patch on large trees, and that comparison stands. Anchored patches depend on exactly one thing: stable node ids. Which happens to be barkup's first guarantee.

## What shipped

barkup 0.2 adds a new subpath export, `@kevinpeckham/barkup/patch`, with a single function:

```ts
import { applyAnchoredPatch } from "@kevinpeckham/barkup/patch";

// Every operation names its target by id; insert and move placements
// anchor to sibling ids, never to positions.
const result = applyAnchoredPatch(grammar, tree, [
  { op: "set-attribute", id: "wgt-heading", key: "maxLength", value: 80 },
  { op: "insert", node: statPanel, after: "wgt-content" },
]);

if (result.ok) {
  result.node; // patched tree, normalized, every untouched id byte-for-byte intact
} else {
  result.issues; // structured problems, each carrying the failing op's index
}
```

The operation set is small on purpose: `set-attribute`, `remove-attribute`, `set-name`, `remove`, `insert`, and `move`, with `before` / `after` / `parentId` placements. Patches are atomic, so one failing operation rejects the whole patch and the input tree is never mutated. The result is validated against your grammar just like a parse, and the `operations` argument is typed `unknown` on purpose: a patch is agent input, so shape problems come back as structured issues you can hand straight back to the model, not as type errors you have to catch. It has zero runtime dependencies and never touches the DOM; it operates on typed trees, before or after any markup crosses the boundary.

## When to reach for it

Nothing here demotes whole-tree rewrite. Rewrite is still the simplest robust interface, and for most edits it is the right default: one coherent artifact, validated in one shot. Anchored patches are the optimization you reach for when token cost or latency starts to bite, especially on longer documents, where resending and rewriting the whole tree on every turn gets expensive. The two winning strategies from the benchmark now both live in the library, and you can pick per workload.

One caution we published here originally did not survive the benchmark's own correction: granular mutation tools are not unreliable. Under corrected conversation history they match rewrite on accuracy at every model tier. The reasons to prefer anchored patches are different, and sturdier. They were the cheapest condition measured at every tree size. They keep addressing nodes correctly on large trees, where positional JSON Patch collapses (index arithmetic breaks down as trees grow). And a single-artifact interface is structurally immune to the failure class the benchmark itself tripped over: there is no hidden tool channel for a framework to silently drop from conversation history.

## Why it belongs in barkup, not beside it

This is a scope extension with evidence behind it, not scope creep. Anchored patches work if and only if node ids are stable across the whole pipeline, and byte-for-byte id preservation is the guarantee barkup was built to provide in the first place. The capability and its one precondition live in the same package by design. The core codec is untouched; this is one validated utility behind its own import, the way the testing helpers already are.

And we are not recommending this from a benchmark alone: barkup 0.2 is already running in production in [Replicator](/customer-stories/replicator-evolution), our AI document platform. A single pre-registered condition is a strong signal, not the last word, so we are about to run a deeper round of benchmarks to see whether anchored patches keep holding up as expected under heavier, more varied workloads. We will publish that too, whichever way it points.

We got here by doing the unglamorous thing in order: argue it, test it in the open, and ship only what survived. barkup 0.2 is [on npm](https://www.npmjs.com/package/@kevinpeckham/barkup) under MIT, and the anchored-patch design note and the full benchmark that motivated it are [in the repo](https://github.com/kevinpeckham/barkup).
