---
title: "The Model Doesn't Need to See Your Tree"
metaTitle: "The Model Doesn't Need to See Your Tree | barkup-bench"
slug: the-model-doesnt-need-to-see-your-tree
description: "Two final pre-registered studies in the barkup-bench series. Study I replaced the full tree in the prompt with a focused view and accuracy didn't move, at 2 to 4% of the input cost, with input that scales with tree depth instead of node count. Study J re-ran the views rendered as HTML instead of JSON: identical accuracy, 9 to 24% fewer tokens, and a small validity edge that partially rehabilitates the claim this whole series started by killing."
date: 2026-07-07T20:00:00Z
draft: false
tags: [ai, agents, llm, benchmark, barkup]
image: https://lj-01.nyc3.cdn.digitaloceanspaces.com/images/blog/blindfold.webp
imageDescription: A watercolor painting of a blindfolded Lady Justice holding a sword and a set of scales
author: Kevin Peckham
quote:
  text: "We hid 98% of the tree from the model. Accuracy didn't drop. On the hardest tasks, it went up."
  attribution: Kevin Peckham, Principal at Lightning Jar
glossary:
  - term: Focused view
    definition: A rendering of a tree that shows the root-to-target path in full and represents everything else as id-bearing placeholders or honest omission counts, so the model sees only the region an edit concerns while every visible id remains a valid patch target.
  - term: Anchored patch
    definition: "A list of edit operations that address nodes by id, with insert and move placements anchored to sibling ids (before, after, or parentId), never by positional path."
  - term: Oracle bound
    definition: A deliberate benchmark simplification in which the task instruction names the target node ids explicitly, so the study measures editing against a view without also measuring how a real system would retrieve the relevant nodes from a vague request.
  - term: Discordant pair
    definition: In a paired comparison, a task that one condition solved and the other failed. McNemar's test decides significance from these pairs alone; when there are almost none, the two conditions are behaving identically task by task.
  - term: Pre-registered benchmark
    definition: A benchmark whose hypotheses, prompts, corpus seeds, and grading are committed to version control before any scored run, so the design cannot be tuned after the fact to flatter the result.
additionalReading:
  - title: "Your Agent's Session Is Drifting (and the Fix Is Cheaper Than the Bug)"
    url: "/blog/your-agents-session-is-drifting"
  - title: "We Found the Crossover (It Wasn't Where Anyone Looked)"
    url: "/blog/we-found-the-crossover"
  - title: "We Benchmarked It: What Held Up in 'HTML as a Native Data Format for LLMs', and What Didn't"
    url: "/blog/barkup-bench-results"
  - title: "A Deprecated Accessor That Still Typechecks Broke My Benchmark (and Maybe Your Agent)"
    url: "/blog/tool-history-footgun"
  - title: "barkup 0.2: We Shipped What the Benchmark Told Us"
    url: "/blog/barkup-0-2-anchored-patches"
  - title: "barkup-bench on GitHub: pre-registration, corpus, and raw analysis"
    url: "https://github.com/kevinpeckham/barkup-bench"
---

***Series note:*** *Fifth post in the barkup-bench series, after [the benchmark](/blog/barkup-bench-results), [the shipped feature](/blog/barkup-0-2-anchored-patches), [the footgun](/blog/tool-history-footgun), and [the crossover](/blog/we-found-the-crossover).*

At the end of [the last post](/blog/we-found-the-crossover), one bill was still unpaid. Id-anchored patches had made the *output* side of large-tree editing cheap and reliable: a few dozen tokens, four seconds, 87 to 100% success at every size we tested. But the input side hadn't moved. Every request still shipped the entire tree to the model, and at a thousand nodes that's 85,642 tokens of context per edit, most of it describing parts of the document the edit will never touch.

So we pre-registered the obvious question: how much of the tree does the model actually need to see?

The answer, measured twice from two different angles, is: almost none of it.

## What we sent instead

A **focused view** renders the path from the root to the nodes the edit concerns in full, and represents everything else as placeholders that keep their ids. We tested two levels of aggression. The fuller view collapses unrelated subtrees to one-line stubs; the minimal view omits them entirely and just says how many it's hiding. A sketch of the shape (simplified):

```html
<div data-type="page" id="p1">
  <div data-type="block" id="b1" data-collapsed="true" data-child-count="12"></div>
  <div data-type="block" id="b4" data-name="pricing">
    <div data-type="text-atom" id="t7" data-name="heading" data-max-length="60"></div>
    <div data-type="text-atom" id="t8" data-name="body" data-max-length="240"></div>
  </div>
  <div data-type="block" id="b9" data-collapsed="true" data-child-count="9"></div>
</div>
```

The contract that matters: the target's complete child list is visible, every id you can see is a legal patch anchor, and anything hidden is hidden *honestly*, with a count, never silently. The patches the model sends back are unchanged from the last study, and they apply to the full tree on the other side of the wall. The model edits a document it has mostly never seen.

## Study I: accuracy didn't move

Same corpus, models, and protocol as the size extension, with the full-input runs as the paired baseline. 180 new cells at 300, 600, and 1000 nodes.

| Success | ~300 nodes | ~600 | ~1000 |
|---|---|---|---|
| claude-sonnet-4.5, full input | 15/15 | 15/15 | 13/15 |
| sonnet, fuller view | 15/15 | 14/15 | 14/15 |
| sonnet, minimal view | 15/15 | 15/15 | **15/15** |
| gemini-3.5-flash, full input | 14/15 | 14/15 | 13/15 |
| gemini, fuller view | 14/15 | 14/15 | 14/15 |
| gemini, minimal view | 13/15 | 14/15 | 14/15 |

No paired comparison against full input reaches significance (McNemar p = 0.5 to 1.0 across all four; the discordant tasks are one to four per comparison and trade in both directions). Sonnet on the *minimal* view went a perfect 45 for 45, numerically better than its own full-input 43.

The cost side is where it stops being a wash and becomes a rout. Median input per thousand-node task: 85,642 tokens with the full tree, 3,500 with the fuller view, 1,531 with the minimal one. That's 2 to 4% of the input cost for the same accuracy. And the minimal view's input barely grows with tree size at all: 1,331 median tokens at 300 nodes, 1,531 at a thousand. It scales with tree *depth*, not node count, which effectively removes the context-window ceiling for id-addressed edits. A solved thousand-node edit costs under a cent on either model. The entire 180-cell study cost about a dollar.

## Less context helped, twice

The perfect 45/45 deserves a closer look, because "removing context improved the model" is the kind of claim that should make you suspicious. We re-graded every failure in the study independently and diffed the outputs.

Sonnet's two full-input baseline failures were both "insert this as the **first** child" tasks, and in both, the model appended the node as the *last* child instead. With 85,000 tokens of tree in front of it, it reached for the lazy parent-append anchor rather than anchoring before the first sibling. With the view, the destination's child list is sitting in plain sight, and both tasks pass. The view arms' own failures are ordinal off-by-ones on move operations and gemini inventing unrequested attributes on under-specified inserts: the same error classes, at the same tasks, as full input. Nothing new went wrong because the tree was hidden. One pre-registered worry, that models would mint duplicate node ids without the full tree to check against, never materialized: zero collisions in 180 runs.

## Study J: then we asked the format question again

This series started by testing whether HTML is a better data format for models than JSON, and the honest answer from the main benchmark was: not measurably, for whole-tree editing. Study I's views, though, were serialized as JSON. If `barkup/view` was going to ship, it would render views in barkup's native HTML dialect. So one final pre-registered study re-ran both view modes with identical content rendered as HTML, keeping the JSON patch dialect and the grading unchanged. The seam was deliberate: HTML view in, JSON patch out, because that's exactly the mixed diet a real barkup pipeline would feed a model.

Three results, in increasing order of interest:

**Accuracy: identical, unusually cleanly.** Paired McNemar per model per mode: p = 1.0 in all four comparisons. Three of the four had *zero* discordant pairs; the other two differed by a single task each. The cross-format seam produced no failure mode at all.

**Tokens: HTML wins at every size.** At a thousand nodes, the fuller view costs 2,669 median input tokens rendered as HTML against 3,500 as JSON (24% less), and the minimal view 1,391 against 1,531 (9% less). The minimal HTML view is about 1.6% of the full-input cost. Attribute-per-line JSON pays a bracket-and-quote tax that a flat attribute string doesn't.

**Validity: a small, unplanned edge.** Exploratorily, the HTML views produced more first-pass-valid patches (84 to 85 of 90, against 80 to 81 for the JSON views), with correction rounds down accordingly. We flag it as exploratory because it wasn't a pre-registered hypothesis and the margin is small. But it's worth naming what it is: the first measured crack of daylight for the fluency claim this series began by killing. Format didn't matter when the model rewrote whole trees. At the view boundary, where the model reads a compressed rendering and must keep its bearings, the format that is also barkup's native dialect was cheaper and, weakly, cleaner. Partial redemption, honestly sized.

## The caveats, pre-registered

The big one: this is the **oracle bound**. Task instructions name their target ids explicitly, so "retrieval" is trivially perfect, and the views were built from exactly the ids each instruction quotes (verified: zero leakage beyond the instruction text). How a real system decides *which* nodes a vague request concerns is a different problem, deliberately untested here. These studies establish that once you know the neighborhood, the model needs nothing else. They say nothing about finding the neighborhood. Single-turn tasks only, two models, n = 45 per model and condition.

***Update (July 2026):*** *The single-turn caveat is now closed. A sixth pre-registered study ran 140 twelve-edit sessions and found that attaching a fresh minimal view to every editing turn is the most accurate session policy at every model tier tested and the cheapest by 4 to 15x; serializing the tree once at session start drifts (claude-sonnet-4.5 fell to 83.8% per-step success by the final third, with only 8 of 20 sessions ending exactly intact, against 19 of 20 for per-turn views). Full write-up: [Your Agent's Session Is Drifting](/blog/your-agents-session-is-drifting).*

## What ships, and the map after five posts

The pre-registered feature gates both passed, so `@kevinpeckham/barkup` gets a `/view` capability with the trimmed contract these studies validated (spine, complete child lists of referenced nodes, honest omission counts, every visible id patch-addressable) and HTML as its native rendering.

Which completes the map this series has been drawing one study at a time:

- **Output side**: id-anchored patches, reliable across model tiers at every size tested, seconds instead of minutes.
- **Input side**: a focused HTML view, same accuracy as the full tree at 2 to 4% of the cost, input growing with depth instead of size.
- **Together**: the cheapest and most reliable tree-editing interface we measured at any size, resting entirely on one property: ids that never move, which is the guarantee the codec existed to provide before any of this data did.

Everything is reproducible: pre-registrations ([BRIEF-I](https://github.com/kevinpeckham/barkup-bench/blob/main/docs/BRIEF-I.md), [BRIEF-J](https://github.com/kevinpeckham/barkup-bench/blob/main/docs/BRIEF-J.md)), corpus, seeds, raw analysis, and every failure transcript, at [barkup-bench](https://github.com/kevinpeckham/barkup-bench). And yes, after [last time](/blog/tool-history-footgun): every failure in Study I was independently re-graded and diffed, and every record in Study J was independently re-graded, with zero mismatches. We read the transcripts now.
