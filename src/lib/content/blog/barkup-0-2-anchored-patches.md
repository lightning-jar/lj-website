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
  - title: "We Found the Crossover (It Wasn't Where Anyone Looked)"
    url: "/blog/we-found-the-crossover"
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

## How a patch edit actually works

A fair question at this point: does the model still see the whole tree? Yes. In both interfaces the prompt contains the full tree plus the edit request, because the model needs the context to find its target either way. Input cost is about the same. The difference is entirely in what comes back.

With whole-tree rewrite, the reply is the entire edited tree, and every untouched node has to come back byte-for-byte. It is like fixing a typo in a book by retyping the book. At a thousand nodes that reply runs to roughly 50,000 output tokens and ten minutes of generation, and one drifted attribute anywhere is a failed edit.

With an anchored patch, the reply is an editor's note: a few operations naming their targets by id. "Set maxLength to 80 on the node whose id is wgt-heading." A few dozen output tokens, applied to the real tree by code, deterministically. The untouched nodes are never regenerated, so they cannot drift; the applier simply does not touch them.

The anchoring is the other half. RFC 6902 addresses nodes by position ("fourth child, then eighth child inside that"), which is like an editor's note reading "page 312, line 14": correct until anything shifts, and dependent on the model counting nested indexes perfectly. An id cannot move out from under the operation that names it.

Output is where models are slow, expensive, and fallible; input is comparatively cheap and reliable. Moving faithful reproduction out of the model and into code is where every win in the numbers above comes from.

## When to reach for it

Nothing here demotes whole-tree rewrite. Rewrite is still the simplest robust interface, and for most edits it is the right default: one coherent artifact, validated in one shot. Anchored patches are the optimization you reach for when token cost or latency starts to bite, especially on longer documents, where resending and rewriting the whole tree on every turn gets expensive. The two winning strategies from the benchmark now both live in the library, and you can pick per workload.

***Update (July 2026):*** *The size extension below sharpens this guidance with a threshold. Below about 200 nodes, either interface works and rewrite stays the simplest default. At or above roughly 300 nodes, anchored patches are the only interface that is simultaneously reliable across model tiers, fast (seconds, not minutes), cheap, and free of transport ceilings.*

One caution we published here originally did not survive the benchmark's own correction: granular mutation tools are not unreliable. Under corrected conversation history they match rewrite on accuracy at every model tier. The reasons to prefer anchored patches are different, and sturdier. They were the cheapest condition measured at every tree size. They keep addressing nodes correctly on large trees, where positional JSON Patch collapses (index arithmetic breaks down as trees grow). And a single-artifact interface is structurally immune to the failure class the benchmark itself tripped over: there is no hidden tool channel for a framework to silently drop from conversation history.

## Why it belongs in barkup, not beside it

This is a scope extension with evidence behind it, not scope creep. Anchored patches work if and only if node ids are stable across the whole pipeline, and byte-for-byte id preservation is the guarantee barkup was built to provide in the first place. The capability and its one precondition live in the same package by design. The core codec is untouched; this is one validated utility behind its own import, the way the testing helpers already are.

And we are not recommending this from a benchmark alone: barkup 0.2 is already running in production in [Replicator](/customer-stories/replicator-evolution), our AI document platform. A single pre-registered condition is a strong signal, not the last word, so we are about to run a deeper round of benchmarks to see whether anchored patches keep holding up as expected under heavier, more varied workloads. We will publish that too, whichever way it points.

We got here by doing the unglamorous thing in order: argue it, test it in the open, and ship only what survived. barkup 0.2 is [on npm](https://www.npmjs.com/package/@kevinpeckham/barkup) under MIT, and the anchored-patch design note and the full benchmark that motivated it are [in the repo](https://github.com/kevinpeckham/barkup).

***Update (July 2026), the size extension:*** *The deeper round of benchmarks promised above has run, and anchored patches did more than hold up. We pre-registered 45 fresh transformation tasks at roughly 300, 600, and 1,000 nodes (well past the original study's ~190-node ceiling) and ran whole-tree rewrite, anchored patches, and RFC 6902 JSON Patch through the corrected protocol-v2 harness on claude-sonnet-4.5 and gemini-3.5-flash. The crossover the original benchmark went looking for exists, and it is a cliff, not a slope.*

| Tasks solved | ~300 nodes | ~600 nodes | ~1000 nodes |
|---|---|---|---|
| sonnet · whole-tree rewrite | 15/15 | 14/15 | 12/15 |
| sonnet · anchored patch | 15/15 | 15/15 | 13/15 |
| sonnet · RFC 6902 patch | 8/15 | 3/15 | 1/15 |
| gemini-flash · whole-tree rewrite | 9/15 | 5/15 | **0/15** |
| gemini-flash · anchored patch | 14/15 | 14/15 | 13/15 |
| gemini-flash · RFC 6902 patch | 8/15 | 3/15 | 2/15 |

![Line chart: task success at 300 to 1000 nodes. Anchored patches hold 87 to 100 percent for both models; whole-tree rewrite falls to zero for gemini-3.5-flash and 80 percent for claude-sonnet-4.5; RFC 6902 JSON Patch decays below 15 percent.](/blog/img/size-extension-light.svg)

*Task success by tree size and model, barkup-bench Study H: 45 pre-registered tasks across three sizes, protocol v2, n = 15 per cell.*

*Above a few hundred nodes, whole-tree rewrite becomes a frontier-model-only technique: gemini-3.5-flash slides from 9/15 to 0/15, while sonnet stays strong (15/15 → 14/15 → 12/15) but only after we switched to a streaming transport, because its unstreamed rewrites of 600-node-and-larger trees (10-to-15-minute generations) were dying at the gateway before the model finished. Anchored patches hold 87 to 100% for both models at every size (pooled, patches beat rewrite 93.3% vs 61.1%, p < 0.0001; for sonnet alone the two are statistically indistinguishable), and positional RFC 6902 decays to between 7 and 13%. The economics at ~1,000 nodes are just as lopsided: per solved task, sonnet rewrite costs about $0.88 and 597 seconds against $0.26 and 4 seconds for a sonnet anchored patch, and $0.037 and 2 seconds for a gemini-flash patch. So the practical rule is now a threshold: at or below about 200 nodes, pick either interface; at or above roughly 300 nodes, anchored patches are the only interface that is reliable across model tiers, fast, cheap, and free of transport ceilings. Full tables and the pre-registered brief are in [barkup-bench](https://github.com/kevinpeckham/barkup-bench).*
