---
title: "We Tried to Delete the Hard Parts. The Benchmark Said No."
metaTitle: "The Benchmark Said No | barkup-bench Studies L and M"
slug: the-benchmark-said-no
description: "Two more pre-registered barkup-bench studies tried to delete the last two hard parts of the recipe: letting the model find its own target nodes, and letting sessions forget their history. Both gates failed. Grounding a human-style description costs 7 to 9 points, model-driven tree navigation costs more than pasting the whole tree and collapses on the cheap tier, naive keyword retrieval lands at 60%, and stateless sessions triple the corrupted end states. The honest boundary is the finding."
date: 2026-07-08T18:00:00Z
draft: false
tags: [ai, agents, llm, benchmark, barkup]
image: https://lj-01.nyc3.cdn.digitaloceanspaces.com/images/blog/oracle.webp
imageDescription: A watercolor painting of an ancient figure with a long flowing white beard crouching with knees drawn up and eyes closed, painted in warm earth tones
author: Kevin Peckham
quote:
  text: "We published the gates before running, and the gates failed, and the honest boundary is more useful than the result we wanted."
  attribution: Kevin Peckham, Principal at Lightning Jar
glossary:
  - term: Grounding
    definition: Resolving a human-style description such as "the image named maple-ember" to the id of the node an edit concerns, the retrieval step that the series' earlier oracle-bound studies deliberately skipped.
  - term: Oracle bound
    definition: A deliberate benchmark simplification in which the task instruction names the target node ids explicitly, so the study measures editing against a view without also measuring how a real system would retrieve the relevant nodes from a vague request.
  - term: Skeleton view
    definition: A minimal rendering of a tree that shows only the upper levels as id-bearing collapsed placeholders with honest child counts, which the model can progressively open with an expand tool to navigate toward a target.
  - term: Stateless session
    definition: A multi-turn editing arrangement in which every turn is a fresh single-turn conversation containing only the current view of the tree and the instruction, with no accumulated conversation history.
  - term: Session drift
    definition: The failure mode of multi-turn editing in which the model's mental picture of the tree falls behind the tree's real state, so later edits are computed against sibling lists that earlier edits have already reshuffled.
  - term: Pre-registered benchmark
    definition: A benchmark whose hypotheses, prompts, corpus seeds, and grading are committed to version control before any scored run, so the design cannot be tuned after the fact to flatter the result.
additionalReading:
  - title: "Stable IDs Are All You Need: Seven Studies on Letting LLMs Edit Trees"
    url: "/blog/stable-ids-are-all-you-need"
  - title: "barkup 0.3: Focused Views, or Why the Model Doesn't Need to See Your Tree"
    url: "/blog/barkup-0-3-focused-views"
  - title: "Your Agent's Session Is Drifting (and the Fix Is Cheaper Than the Bug)"
    url: "/blog/your-agents-session-is-drifting"
  - title: "The Model Doesn't Need to See Your Tree"
    url: "/blog/the-model-doesnt-need-to-see-your-tree"
  - title: "barkup-bench on GitHub: pre-registration, corpus, and raw analysis"
    url: "https://github.com/kevinpeckham/barkup-bench"
---

[barkup-bench](https://github.com/kevinpeckham/barkup-bench) is our open, pre-registered benchmark series on a narrow question with broad consequences: what is the most reliable way to let an LLM agent edit structured data, like page layouts, document templates, and other typed trees? It began with [an argument about HTML as a data format](/blog/ast-as-html), grew into seven studies and one very public correction, and if you are new here, the whole arc is summarized in [Stable IDs Are All You Need](/blog/stable-ids-are-all-you-need).

The short version: by last week the series had assembled a pleasingly cheap recipe. Address nodes by stable id. Reply with small anchored patches instead of rewriting the document. Show the model a focused view of the relevant region instead of the whole tree. Refresh that view on every turn of an editing session. Each step was pre-registered, measured, and [shipped in a small open-source library](/blog/barkup-0-3-focused-views). Input costs stopped scaling with document size. Sessions stopped drifting.

Two hard parts remained, and both looked deletable. The model still
needed to be told *which* nodes an edit concerns (our tasks named
their target ids, an oracle assumption we flagged in every post).
And sessions still carried full conversation history, which grows
without bound and is exactly where the nastiest bug of this series
once lived. So we pre-registered two more studies to delete them:
let the model find its own targets, and let sessions forget.

Both gates failed. This post is about how they failed, because the
failure shapes are more useful than the successes would have been.

## Study M: the view carries the state, but memory still matters

The setup: our session studies showed that attaching a fresh
1.5k-token view of the current tree to every turn eliminates drift.
If the view carries the state, what is the history for? We ran the
same twelve-edit sessions with no conversation memory at all (every
turn a fresh, single-turn conversation: view plus instruction) and
with a two-exchange sliding window.

The economics worked exactly as predicted. Stateless input is flat:
about 1,300 tokens at step one and at step twelve, forever, no
context ceiling, and structurally immune to history-construction
bugs because there is no history to construct.

The accuracy did not. Sonnet lost 7 steps to 0 against full history
(p = 0.016), and sessions ending with a byte-perfect tree dropped
from 19 of 20 to 13 of 20. Every stateless-only failure was a
late-session placement edit: a legal patch, validated and applied,
with the new node in the wrong position. The model saw the same
child lists in the same view either way. History was providing
redundancy for positional reasoning that the view alone does not,
and the two-exchange window recovered only part of it.

So the guidance is the boring version: keep the history and the
per-turn view. At twelve-edit lengths, history costs about 55k input
tokens per session, and deleting it buys you three times the
corrupted sessions. They cover different failure modes; you want
both.

## Study L: finding the node is the actual job

The setup: we regenerated our large-tree editing tasks with the ids
stripped out of the instructions. Instead of "the node with id
n819", the model gets what a person would say: "the image named
maple-ember", or "the 3rd block inside the section named atlas".
Every description was programmatically verified to match exactly one
node, so ambiguity was never the model's problem. Then we compared
three ways of supplying context: the whole tree in the prompt, a
skeleton view plus an expand tool the model drives itself, and a
deliberately dumb keyword retriever feeding the focused view.

First result: models are decent grounders when they can see
everything. With the full tree in context, sonnet solved 86.7% and
gemini 84.4%, against oracle bounds of 95.6% and 91.1%. Call it a 7
to 9 point tax for describing instead of naming. Real, but far from
disqualifying.

Second result, and the one we would most like agent builders to
read: **the explore-the-tree-yourself pattern is a trap.** On the
frontier model it actually works, 43 of 45, matching the oracle
bound. But it took a median of 54 expand calls per task, and all
those expansions plus their accumulating history cost more input
tokens than just pasting the entire tree would have. And on the
cheap model it does not work at all: 51%, with most failures being
the model wandering the tree until its budget ran out without ever
producing a patch. Navigation joins whole-tree rewrite in the
category of techniques that are accurate exactly where you least
need the savings.

Third result: the keyword retriever landed at 60%, with nearly every
failure a clean miss (the target region never made it into the
view). That was the floor by design. The distance between it and the
oracle is the value your application's retrieval layer has to add.

## What the pair of failures buys

A benchmark series that only ever confirms its own thesis is
advertising. These two studies are why we trust the rest of ours:
the same pre-registration discipline that produced "views are free"
and "sessions need fresh views" also produced "views cannot find
themselves" and "sessions cannot forget". We published the gates
before running, and the gates failed, and the honest boundary is
more useful than the result we wanted:

- Stable ids make edits cheap and reliable at any size we tested.
- Views make the input cost of *known* edits nearly free.
- History makes sessions hold together; keep it.
- And the one part you cannot outsource to the codec or the prompt:
  knowing which nodes the user means. That is retrieval, it is your
  application's job, and naive keyword matching is not enough.

Everything is reproducible from the
[benchmark repo](https://github.com/kevinpeckham/barkup-bench):
pre-registrations (BRIEF-L, BRIEF-M, including one disclosed pre-run
amendment), corpora, unit-tested graders, raw analyses. Combined
cost of both studies: about fifty dollars, and two hypotheses we
were fond of.
