---
title: "Your Agent's Session Is Drifting (and the Fix Is Cheaper Than the Bug)"
metaTitle: "Session Drift in LLM Agents | barkup-bench Study K"
slug: your-agents-session-is-drifting
description: "Benchmarks grade single edits; production agents run twelve-edit conversations. We pre-registered a session study: 140 sessions, 1,680 graded steps, four ways of showing the model the tree it's editing. Serialize-once drifts, and the drift is invisible until you diff the end state. Refreshing periodically is the worst of both. And the policy that wins on accuracy at every model tier, a fresh focused view every turn, is also the cheapest by 4 to 15x. The most dangerous policy passes validation while silently corrupting the tree."
date: 2026-07-07T22:00:00Z
draft: false
tags: [ai, agents, llm, benchmark, barkup]
image: https://lj-01.nyc3.cdn.digitaloceanspaces.com/images/blog/photography-microscope.webp
imageDescription: A watercolor painting of a girl looking through the eyepieces of a large optical instrument
author: Kevin Peckham
quote:
  text: "The most accurate session policy was also the cheapest one. That almost never happens."
  attribution: Kevin Peckham, Principal at Lightning Jar
glossary:
  - term: Editing session
    definition: A multi-turn conversation in which an agent makes a sequence of edits to the same artifact, each turn building on the state its own earlier edits produced. The production shape of agent editing, and the thing single-task benchmarks don't measure.
  - term: Serialization policy
    definition: The rule for what representation of the artifact each turn's prompt contains, such as showing the full tree once at the start, re-sending it periodically, or attaching a fresh focused view every turn.
  - term: Session drift
    definition: The gradual divergence between the artifact's real state and the model's picture of it, as edits accumulate and the serialization in the conversation history goes stale.
  - term: End-state integrity
    definition: Whether the artifact at the end of a whole session exactly matches the result of applying every requested edit correctly. A per-step grade can look good while the end state is quietly wrong.
  - term: Focused view
    definition: A rendering of a tree that shows the region an edit concerns in full and represents everything else as id-bearing placeholders or honest omission counts, so every visible id remains a valid patch target.
  - term: Pre-registered benchmark
    definition: A benchmark whose hypotheses, prompts, corpus seeds, and grading are committed to version control before any scored run, so the design cannot be tuned after the fact to flatter the result.
additionalReading:
  - title: "The Model Doesn't Need to See Your Tree"
    url: "/blog/the-model-doesnt-need-to-see-your-tree"
  - title: "We Found the Crossover (It Wasn't Where Anyone Looked)"
    url: "/blog/we-found-the-crossover"
  - title: "A Deprecated Accessor That Still Typechecks Broke My Benchmark (and Maybe Your Agent)"
    url: "/blog/tool-history-footgun"
  - title: "We Benchmarked It: What Held Up in 'HTML as a Native Data Format for LLMs', and What Didn't"
    url: "/blog/barkup-bench-results"
  - title: "barkup-bench on GitHub: pre-registration, corpus, and raw analysis"
    url: "https://github.com/kevinpeckham/barkup-bench"
---

***Series note:*** *Sixth post in the barkup-bench series, after [the benchmark](/blog/barkup-bench-results), [the shipped feature](/blog/barkup-0-2-anchored-patches), [the footgun](/blog/tool-history-footgun), [the crossover](/blog/we-found-the-crossover), and [focused views](/blog/the-model-doesnt-need-to-see-your-tree).*

Every study in this series so far graded single edits: one request, one change, one grade. Production doesn't work like that. A real agent session is a conversation: *add a pricing section... now move it above the testimonials... make the third column wider... actually, delete the second card you added.* Twelve edits, one thread, each one building on state the model's own earlier edits produced.

Which raises a question none of our earlier studies could answer: across a whole session, what should each turn's prompt actually contain? The whole tree, once, at the start? The whole tree again every few turns? A fresh focused view each time?

So we pre-registered one more study. Twelve sequential edits per tree, at 150 and 300 nodes, with 51 of the steps deliberately referencing nodes the session itself created earlier. Four serialization policies, 140 sessions, 1,680 graded steps, every patch applied to the model's *current* tree and every step graded against ground truth computed from the model's own pre-step state, so one mistake doesn't unfairly poison the grades that follow.

## The four policies

- **Serialize once**: the full tree appears in the first message and never again. The conversation history keeps it visible; it just gets staler with every edit.
- **Periodic refresh**: the full tree is re-sent at steps 6 and 11.
- **Fresh view every turn**: each edit request arrives with a ~1.5k-token minimal [focused view](/blog/the-model-doesnt-need-to-see-your-tree) centered on the nodes that turn concerns. Never the whole tree.
- **Whole-tree rewrite**: the model replies with the entire edited tree each turn, the strategy this series originally championed, now tested as a session protocol.

## What twelve turns does to each policy

Per-step success by session third (claude-sonnet-4.5 / gemini-3.5-flash), plus whether the tree at the end of the session was exactly right:

| Policy | steps 1 to 4 | steps 5 to 8 | steps 9 to 12 | end-state intact |
|---|---|---|---|---|
| Serialize once | 98.8% / 98.8% | 92.5% / 100% | **83.8%** / 96.3% | 8/20 / 17/20 |
| Refresh at 6 and 11 | 98.8% / 100% | 92.5% / 100% | 91.3% / 91.3% | 11/20 / 15/20 |
| Fresh view every turn | 100% / 98.8% | 98.8% / 100% | **100%** / 98.8% | **19/20 / 19/20** |
| Whole-tree rewrite | 97.2% / 52.5% | 100% / 67.5% | 94.4% / 69.2% | 7/10 / **2/10** |

Serialize-once drifts, and on the frontier model it drifts badly: sonnet decays from 98.8% to 83.8% by the last third of the session, and only 8 of 20 sessions end with an exactly-correct tree. The per-step numbers understate it, because a step graded "success" can still sit inside a session whose accumulated state has quietly diverged. Paired per session and step, there were 19 tasks only the fresh-view policy solved and **zero** that only serialize-once solved (p < 0.001; in the last third the split is 13 to 0).

The fresh-view policy doesn't drift at all. Sonnet went 239 of 240 steps across every stage of every session, and both models finished 19 of 20 sessions with the end state exactly intact.

## The mechanism is ordinal, and the surprise is who suffers

The failure audit localizes the decay precisely: it concentrates in **ordinal placement**. Insert and move edits under serialize-once fall from 95% to 85% to 80% as the session ages, while the fresh-view policy holds around 98% at every stage. Steps that reference nodes created earlier in the session succeed 99.0% of the time with fresh views and 92.2% without. The tree in the history says the sidebar has four children; nine edits later it has seven, and "insert as the third child" anchors against a memory.

And here's the finding that made us grin: **gemini-3.5-flash barely drifts under serialize-once** (96.3% in the last third). The cheap model is fine at tracking its own visible patch history; it's the frontier model that leans on its stale mental picture and fumbles. If you read [the footgun post](/blog/tool-history-footgun), you know we once published "small models are fragile in multi-turn tool use" and had to retract it: the fragility was our harness *hiding* the models' tool history. Study K is the complement, measured independently: give a small model *visible* history and it tracks twelve turns of its own edits just fine. Hidden history was the disease. Visibility is the cure, at every tier.

## The part that never happens: the best policy is the cheapest

Accuracy improvements usually cost something. This one doesn't. Median input per 12-edit session:

- Fresh view every turn: **~55k tokens**
- Serialize once: ~215k (the once-shown tree rides along in the history of every subsequent turn, so showing it once saves nothing)
- Periodic refresh: ~366k (the worst of both: the stale copy *and* fresh copies accumulate)
- Whole-tree rewrite: ~836k to 971k in, plus ~130k out

That's 4 to 15× cheaper than every alternative, while being the most accurate at every tier tested. The intuition from [the focused-views study](/blog/the-model-doesnt-need-to-see-your-tree) carries over cleanly: the model doesn't need to see your tree, and in a session it especially doesn't need to see your tree *as it was nine edits ago*.

## Rewrite is not a session protocol

The strategy this series began by defending has a hard limit, and sessions found it. Two structural failure modes, neither of which is about model intelligence:

**The conversation stops fitting.** Twelve accumulated whole-tree rewrites of a 300-node tree deterministically exhausted sonnet's 200k context window at step 11. We re-ran the session to check; it died at the same step. There is no prompt fix for arithmetic.

**Below the frontier, the damage is silent.** Gemini's rewrite sessions collapsed to 52 to 69% per-step success at 300 nodes, with individual sessions as low as 0 for 12, and all 44 of its graded failures were **valid-but-wrong**: trees that parse, validate, and render while carrying accumulated drift, compounding step over step. Only 2 of 10 sessions ended intact. A loud failure gets caught; these wouldn't be.

To be clear about scope: single-shot rewrite below ~300 nodes remains fine, exactly as [the crossover study](/blog/we-found-the-crossover) measured. What's out is rewrite as the *protocol for a session*: repeat it and you are marching toward a context ceiling at best and silent corruption at worst.

## The honesty sidebar

Two of the three providers cache prompt prefixes by default and won't let you turn it off, and sessions (long, growing, identical prefixes) are exactly the workload caching targets. So we audited instead of hand-waving: the harness records provider-reported cache reads per call, and the audit covers all 46,258 calls in the benchmark. Session cost comparisons above are in tokens, which the audit confirms are caching-independent (reported input counts include cached tokens). In dollars, gemini's default implicit caching covered 44 to 74% of session input while our stock Anthropic integration caches nothing (it's opt-in, and a production deployment would enable it), so cross-vendor session *dollar* comparisons are comparisons of default configurations, not of models. Every previously published figure in this series is unaffected: the focused-view studies were fully cache-free, as were the cells behind every dollar figure we've quoted. The whole session study cost about $93 at list prices.

## What we changed in production the same day

Our document platform's template agent already rebuilds its context from the *current* tree on every request, so it never had the serialize-once bug. But Study K exposed a residual gap: views the model requested in *earlier turns* sit in the conversation going stale, and nothing told the model not to trust them. Its prompt now says so explicitly: views from earlier turns are stale; request a fresh one before editing anything you haven't just looked at. That's the whole fix. It shipped within hours of the data.

The practical rule, if you build editing agents: **attach a fresh minimal view to every editing turn.** It's the most accurate policy at every model tier we tested, the cheapest by 4 to 15×, structurally immune to context-window exhaustion, and it removes the one failure class that grows with session length.

Everything is reproducible: the pre-registration ([BRIEF-K](https://github.com/kevinpeckham/barkup-bench/blob/main/docs/BRIEF-K.md)), corpus, seeds, raw analysis, the cache audit, and every session transcript, at [barkup-bench](https://github.com/kevinpeckham/barkup-bench). The audit re-checked every session against its invariants (zero violations), and the two mid-study harness changes were recording-only and are disclosed in the report. We read the transcripts now. All of them.
