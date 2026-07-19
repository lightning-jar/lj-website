---
title: "barkup 0.3: Focused Views, or Why the Model Doesn't Need to See Your Tree"
metaTitle: "barkup 0.3 | Focused Views"
slug: barkup-0-3-focused-views
description: "barkup 0.3 ships focused views: instead of serializing the whole tree into the model's prompt, renderView renders only the part an edit concerns, and the model patches the full tree from that partial picture. Three pre-registered studies backed the feature before it shipped: accuracy statistically unchanged at 2 to 4% of the input cost, HTML as the native rendering, and a per-turn view that erases session drift while costing four times less."
date: 2026-07-08T12:00:00Z
draft: false
tags: [ai, agents, llm, open-source, barkup]
image: https://lj-01.nyc3.cdn.digitaloceanspaces.com/images/blog/dog-02.webp
imageDescription: A watercolor painting of a pug puppy sitting and looking at the viewer
author: Kevin Peckham
quote:
  text: "Every visible id is a valid patch target. What the model can see, it can patch, and what it cannot see, it is told exists."
  attribution: Kevin Peckham, Principal at Lightning Jar
glossary:
  - term: Focused view
    definition: A rendering of a tree that shows the root-to-target path in full and represents everything else as id-bearing placeholders or honest omission counts, so the model sees only the region an edit concerns while every visible id remains a valid patch target.
  - term: Anchored patch
    definition: "A list of edit operations that address nodes by id, with insert and move placements anchored to sibling ids (before, after, or parentId), never by positional path."
  - term: Oracle bound
    definition: A deliberate benchmark simplification in which the task instruction names the target node ids explicitly, so the study measures editing against a view without also measuring how a real system would retrieve the relevant nodes from a vague request.
  - term: Session drift
    definition: The failure mode of multi-turn editing in which the model's mental picture of the tree falls behind the tree's real state, so later edits are computed against sibling lists that earlier edits have already reshuffled.
  - term: Conformance vectors
    definition: Machine-generated input/output test cases exported by the benchmark's own renderer, replayed in the package's test suite to prove the shipped implementation is equivalent to the one the data validated.
additionalReading:
  - title: "barkup 0.4: The Model Finds the Node Now"
    url: "/blog/barkup-0-4-content-search"
  - title: "Then We Found the Cheap Part: One Search Call Grounds LLM Tree Edits"
    url: "/blog/then-we-found-the-cheap-part"
  - title: "We Tried to Delete the Hard Parts. The Benchmark Said No."
    url: "/blog/the-benchmark-said-no"
  - title: "The Model Doesn't Need to See Your Tree"
    url: "/blog/the-model-doesnt-need-to-see-your-tree"
  - title: "Your Agent's Session Is Drifting (and the Fix Is Cheaper Than the Bug)"
    url: "/blog/your-agents-session-is-drifting"
  - title: "barkup 0.2: We Shipped What the Benchmark Told Us"
    url: "/blog/barkup-0-2-anchored-patches"
  - title: "We Found the Crossover (It Wasn't Where Anyone Looked)"
    url: "/blog/we-found-the-crossover"
  - title: "barkup-bench on GitHub: pre-registration, corpus, and raw analysis"
    url: "https://github.com/kevinpeckham/barkup-bench"
  - title: "@kevinpeckham/barkup on npm"
    url: "https://www.npmjs.com/package/@kevinpeckham/barkup"
---

barkup 0.3 ships one new capability behind one new import: **focused views**. Instead of serializing the whole tree into the model's prompt, `renderView` renders only the part an edit concerns, and the model patches the full tree from that partial picture. Like the anchored patches we shipped in 0.2, the feature arrived with a benchmark attached: three pre-registered studies, and the feature gates were written down before the first scored run.

## What the data said

The [anchored-patch work](/blog/barkup-0-2-anchored-patches) left one cost on the table. A patch's output is a few dozen tokens, but the input still carried the entire tree, about 85,000 tokens at 1,000 nodes, resent on every request. Study I asked the obvious question: does the model actually need all of it?

It does not. We replaced the full tree with a focused view (the path from the root to the referenced nodes, their child lists in order, everything else collapsed to labeled placeholders or omitted with a count) and patch accuracy did not move. Statistically indistinguishable from full input for both models tested, at every size from 300 to 1,000 nodes, and claude-sonnet-4.5 on the most aggressive view solved 45 of 45 tasks. Median input fell from 85,642 tokens to as low as 1,531, a 96 to 98% reduction, and the view barely grows as the tree does: it scales with tree depth, not node count. For id-addressed edits, document size stops mattering to your token bill.

Study J then settled the serialization question. The same view content rendered in barkup's HTML dialect (placeholders as `data-collapsed` elements with honest `data-child-count`) matched the JSON rendering exactly: p = 1.0 in all four paired comparisons, three of them with zero discordant tasks, while running 9 to 24% terser with fewer correction rounds. HTML is the native rendering.

Study K supplied the reason to use views even when cost is not your problem. Over twelve-edit sessions against one evolving tree, a model shown the tree once decayed to 83.8% per-step success by the final third (stale sibling lists ruin ordinal placements), and only 8 of 20 sessions ended byte-intact. A fresh minimal view attached to every turn erased the drift entirely (239 of 240 steps, 19 of 20 sessions) and cost four times less, because the once-shown tree rides along in conversation history every turn anyway. The most accurate session policy and the cheapest one turned out to be the same policy.

## What shipped

A new subpath export, `@kevinpeckham/barkup/view`, with a single function and zero runtime dependencies:

```ts
import { renderView, VIEW_PROMPT_RULES } from "@kevinpeckham/barkup/view";

const result = renderView(grammar, tree, {
  focus: ["wgt-heading"],   // the node ids the edit concerns
  mode: "minimal",          // default; "focused" keeps sibling placeholders
});

if (result.ok) {
  result.html; // spine rendered fully, the rest collapsed or counted
} else {
  result.issues; // e.g. an unknown focus id: structured, never silent
}
```

The contract is exactly what the benchmark validated. The path from root to every focus node renders in full. Children of focus nodes always appear, in document order, so placements like "third child" stay resolvable. Collapsed nodes are real, id-bearing elements with honest child counts, and omissions are counted, never silent. And the invariant that makes it compose with the patch dialect: **every visible id is a valid patch target.** What the model can see, it can patch, and what it cannot see, it is told exists.

Two smaller things shipped alongside. `VIEW_PROMPT_RULES` exports the exact prompt block the benchmark ran, which matters more than it looks: across 360 scored view runs, models minting fresh ids for new nodes collided with hidden ids exactly zero times, and that behavior is attributable to this wording. And the package's test suite now replays 39 view conformance vectors generated by the benchmark's own renderer, the same arrangement that let 0.2's patch applier prove itself equivalent to the implementation the data validated.

## When to reach for it

The updated guidance, now spanning size and time:

- **Single edits, small trees (under about 200 nodes):** anything id-stable works; whole-tree rewrite is still the simplest.
- **Single edits, large trees (about 300 nodes and up):** anchored patches, and there is no longer a reason to pay for full-tree input; render a view instead.
- **Editing sessions of any length:** attach a fresh minimal view to every patch turn. It is the most accurate policy at every model tier we tested and the cheapest by a factor of four, and it removes the one failure class that grows with session length.

One caveat we will keep repeating: the studies name their target ids in the instructions, so this is the oracle bound. Deciding *which* nodes a vague request concerns is your application's retrieval problem, and it is deliberately outside barkup's scope. barkup answers "render me a faithful, patch-safe partial view around these ids"; your app answers "which ids".

***Update (July 2026):*** *A pre-registered follow-up (Study L) has since tested this boundary. Grounding a human-style description with the full tree in context costs 7 to 9 points of accuracy relative to id-anchored instructions. Letting the model navigate a skeleton view with an expand tool reaches oracle-level accuracy on the frontier tier, but at a median of 54 expansions per task it costs more than showing the whole tree, and it collapses on the cheap tier. Naive lexical retrieval lands near 60%. The boundary stands: know your ids, or invest in retrieval that is genuinely better than keyword overlap. A companion study (M) also tested dropping conversation history in sessions since the per-turn view carries the state: economics confirmed, accuracy refuted, so keep the history and the view. Details: Studies L and M in the [benchmark repo](https://github.com/kevinpeckham/barkup-bench).*

## Why it belongs in barkup

Same argument as 0.2, one layer up. A partial view is only safe if every visible id really exists and really survives round trips, and byte-for-byte id preservation is the guarantee barkup was built around. Views and patches are two halves of one contract: the view is the addressable surface, the patch is the addressing. The core codec is untouched; this is one validated utility behind its own import, next to `/patch` and `/testing`.

Pre-registrations, corpora, raw analyses, and the conformance vectors are all in [barkup-bench](https://github.com/kevinpeckham/barkup-bench) (Studies I, J, and K in REPORT.md). The package is on [npm](https://www.npmjs.com/package/@kevinpeckham/barkup) as 0.3.0, published with provenance.

## Update: focus every node the request mentions (Study U)

The recipe in this post took one thing for granted: that the instruction carries every value the edit needs. Study U measured what happens when it does not ("set A's content to the same value as B's") and the answer is the quietest failure in the series: against a target-only view, both models invented plausible values on all 90 cells, and every invention was a valid patch that applied cleanly. The rule that fixes it fits in the focus array you are already passing: `renderView(grammar, tree, { focus: [targetId, sourceId] })`, every node the request mentions. That scored 90 of 90 at 25 times less input than a whole-tree prompt. View scope is a correctness contract, not an optimization. Details in [The Two Things Your Agent Can't See](/blog/the-two-things-your-agent-cant-see).
