---
title: "The Frontier Doesn't Need the Training Wheels (We Re-Ran Everything to Find Out)"
metaTitle: "The Frontier Doesn't Need the Training Wheels | barkup-bench Study AD"
slug: the-frontier-doesnt-need-the-training-wheels
description: "Twenty-nine studies of our benchmark series validated an editing stack on two models, and then the product shipped on a third. That gap has a name in our own findings: serializer advice inverts between models, and per-tier behavior cannot be extrapolated. So Study AD re-ran the entire core stack on claude-opus-4.8, the tier our surfaces actually run, with every corpus, prompt, and grader reused verbatim. Every gate passed, mostly at the top of the prior bands. And the ablation produced the study's real finding: the worked examples that rescued sonnet's stateless sessions are not needed on the frontier tier at all. Bare stateless sessions scored a perfect 240 of 240. The training wheels are for the smaller bikes, and they cost so little you should keep them bolted on anyway."
date: 2026-07-15T16:00:00Z
draft: true
tags: [ai, agents, llm, open-source, barkup, benchmarks]
image: https://lj-01.nyc3.cdn.digitaloceanspaces.com/images/blog/training-wheels.webp
imageDescription: A watercolor painting of a small bicycle with training wheels parked beside a large road bicycle
author: Kevin Peckham
quote:
  text: Every gate passed on the model we actually ship. The training wheels turned out to be for the smaller bikes, and they cost so little we kept them anyway.
  attribution: Kevin Peckham, Principal at Lightning Jar
glossary:
  - term: Confirmation study
    definition: "A study that re-runs previously validated recipes on a new condition (here, a new model tier) with everything else held fixed, and pre-registers pass thresholds anchored to the original results before the first scored call."
  - term: The shipped tier
    definition: "The model a product actually runs in production, as opposed to the models a benchmark happened to measure. Ours is claude-opus-4.8; the core stack had been validated on claude-sonnet-4.5 and gemini-3.5-flash."
  - term: Worked examples
    definition: "Two canned demonstrations (an ordinal insert and an ordinal move on an unrelated tree, about 900 tokens) placed in the system prompt. Study P found they fully substitute for conversation history on sonnet and gemini. Study AD found the frontier tier does not need them."
  - term: Model inversion
    definition: "When the best strategy flips between models. Study Q found sonnet edits better from focused views while gemini edits better from the full tree, which is why nothing in this series is assumed to transfer between tiers without a measurement."
additionalReading:
  - title: "Hand It Everything It Needs: 23 Pre-Registered Studies on LLM Document Editing"
    url: "/blog/hand-it-everything-it-needs"
  - title: "Two Examples Replace a Memory: What Conversation History Was Actually Doing"
    url: "/blog/two-examples-replace-a-memory"
  - title: "We Found the Crossover (It Wasn't Where Anyone Looked)"
    url: "/blog/we-found-the-crossover"
  - title: "The Builder's Playbook: ten measured guidelines for LLM document-editing apps, with code examples"
    url: "/research/barkup-bench/playbook"
  - title: "barkup-bench research dashboard"
    url: "/research/barkup-bench"
  - title: "barkup-bench on GitHub: pre-registration, corpus, and raw analysis"
    url: "https://github.com/kevinpeckham/barkup-bench"
---

[barkup-bench](/research/barkup-bench) is our open, pre-registered benchmark series on how LLM agents should edit structured documents. Twenty-nine studies in, it had a quiet embarrassment. The core editing stack the series validated (id-anchored patches, focused views, search-then-patch grounding, the session recipes) was measured almost entirely on claude-sonnet-4.5 and gemini-3.5-flash. The product surfaces downstream of this research run claude-opus-4.8.

For most benchmarks that gap would be a footnote. For this one it is a named hazard, because two of our own findings forbid papering over it. Study Q found the series' first model inversion: sonnet edits better from focused views, gemini edits better from the full tree, so serializer advice is not model-independent. Study AA then watched a capability ordering flip under a one-rule change to a context pack, which is why its registered fence reads: never bank on a per-tier profile; test the shipped tier on the shipped configuration.

We had been citing those fences for months while shipping recipes to a tier they had never been run on. Study AD is the repayment. Re-run the whole core stack on claude-opus-4.8, change nothing else, and let the gates say whether the stack transfers.

## The experiment: confirmation, not exploration

A confirmation study earns its keep by refusing to be creative. Every corpus, condition, prompt, grader, and runner came from the source studies verbatim: the 200-task main corpus for the patch dialect, the size-extension corpus for focused views at 300 to 1000 nodes, the grounded corpus for the search recipe, the session corpus for the three session policies, and the fan-out corpus for the honest weakness. The gates were pre-registered and anchored to the weakest tier the source study had counted as passing, so the question was exactly "is opus at least as good as the measured band," never "can we find something new to like."

That came to 1,160 cells on one model, about forty-five dollars, zero harness errors.

## The result: every gate passed, mostly at the ceiling

| Arm | Prior band (sonnet / gemini era) | claude-opus-4.8 |
|---|---|---|
| Patch dialect, main corpus | 182 to 188 of 200 | **194/200** |
| Focused views, both HTML modes | 40 to 44 of 45 per mode | **45/45 and 45/45** |
| Search grounding | 43 sonnet, 39 gemini | **43/45** |
| Sessions, intact end states | 18 to 19 of 20 | **20/20 in every policy** |
| Full tree patches at ~1000 nodes | 13 of 15 | 14/15 |
| Fan-out, best arm | 62 to 69% | 80 to 89% |

The dialect's 194 of 200 is the best condition-F number ever measured on the main corpus, and the miss anatomy matters more than the count: five of the six failures were tree-reading questions (count the nodes of a type, answer off by a few) and one was a reference resolution, which means the patch channel itself, the thing every downstream surface routes edits through, was error-free. The focused views swept 90 of 90 across every size, the first perfect view sweep in the series. Search grounding landed exactly on sonnet's oracle bound with a median of one search call. Sessions were flawless in all three policies.

So the headline is boring in the best way: the stack transfers. Every "measured on sonnet and gemini" caveat we have been dutifully attaching to the core recipes closes for the tier that actually runs them.

## The real finding: the training wheels

The interesting result came from the arm we included as an ablation.

Back in Study P we discovered what conversation history was actually doing for editing sessions: teaching, not remembering. Two canned worked examples (an ordinal insert and an ordinal move on a tree the model never edits, about 900 tokens) fully replaced history on both models tested. That finding became a shipped feature, a system-prompt block that protects a session's first edits, which have no history to learn from.

It was also, on sonnet, unmistakably load-bearing. Take history away without the examples and sonnet's stateless sessions dropped to 13 of 20 intact end states, failing on exactly the ordinal placements the examples teach.

Study AD ran that bare arm on opus. No history. No worked examples. A fresh minimal view each turn and nothing else. It scored 240 of 240 steps with 20 of 20 intact end states, indistinguishable from the fully equipped policies, zero discordant steps anywhere.

The frontier tier does not need the training wheels. Opus produces correct ordinal inserts and moves with no precedent at all, at least at the 12-step horizon and on this corpus. What sonnet had to be taught, opus already knows.

Two practical consequences follow, and they point in opposite directions. First, the measured cost floor for frontier-tier edit flows just dropped: a fresh view per turn with nothing else runs about 20k input tokens per 12-edit session, versus about 65k for history plus views. If you run a frontier model and your edit traffic is high-volume, that is the number to know. Second, keep the wheels bolted on anyway. The block costs about 900 flat tokens, it demonstrably rescues every tier below the frontier, and the moment you add a cheaper fallback model or reroute traffic under load, it is the difference between the recipe holding and the recipe silently degrading. Insurance you have already paid to validate is the cheapest kind.

## The boundary that stayed a boundary

Fan-out ("set X on every text-atom inside this block") remains the series' honest weakness, and opus does not close it. It raises the floor impressively: 80% from views and 89% from the full tree, against a prior band of 62 to 69%. But on tasks with seven or more targets it still left a third of the view-arm cells partially covered, the same failure anatomy as every tier before it, models stopping short of the target set with no error anywhere.

Opus also managed to compose the mitigation question a third way. Sonnet does fan-out better from views. Gemini does it better from the full tree. Opus leans full tree, not significantly, which makes three distinct profiles from three models and settles the matter about as firmly as it can be settled: there is no model-independent fan-out prompt strategy, and there is no tier good enough to make one unnecessary. The fix stays what Studies Q and R measured it to be. Enumerate the targets deterministically in your application and issue one single-target edit per node. That recipe scored 674 of 674 subtasks, and nothing in Study AD gives any reason to route around it.

## What this changes for builders

Mostly, what it changes is what you can stop worrying about. If you ship the measured stack (anchored patches, focused views scoped to every mentioned node, one search call for grounding, generous history or examples plus a memo and an echo) on a frontier Claude tier, every piece of it now has direct data on that tier, and the data says ceiling. The one new number worth acting on is the frontier cost floor for stateless edit flows, and the one standing order is unchanged: bulk edits go through app-side decomposition, on every tier, still.

There is also a methodological moral we keep re-learning. The two most quotable findings of this series' last week (opus is the least literal rule-follower, and opus needs no worked examples) point in opposite directions from what "it's the strongest model" would have predicted in either case. Tier behavior is not a scalar. If your product's model differs from your eval's model, you do not have an eval; you have a hope. Re-running ours cost forty-five dollars.

The usual caveats travel with the numbers: one model confirmed, one grammar, seeded corpora, deterministic grading, a 12-step session horizon for the ablation. Two things were deliberately excluded and stay unmeasured on opus: whole-tree rewrite at 300-plus nodes (not a shipped path, and 50k-token outputs make it an expensive curiosity) and the search recipe's spiral behavior under fan-out. Everything else is reproducible from the [benchmark repo](https://github.com/kevinpeckham/barkup-bench), pre-registration first as always, and the chart set lives on the [research dashboard](/research/barkup-bench#sec-opus). Thirty studies in, the series finally measures the model it ships.
