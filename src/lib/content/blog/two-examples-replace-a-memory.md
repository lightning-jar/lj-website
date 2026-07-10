---
title: "Your Agent Doesn't Need a Memory: Two Worked Examples Replace Session History"
metaTitle: "Your Agent Doesn't Need a Memory | barkup-bench Studies P and Q"
slug: two-examples-replace-a-memory
description: "Two more pre-registered barkup-bench studies. Study P found what session history was actually doing all along: teaching, not remembering. Two unit-tested worked examples pasted into the system prompt restore stateless editing sessions to full-history accuracy on both models, at a flat 2,100 input tokens per step with no context ceiling. Study Q stress-tested the shipped recipe against fan-out edits and everything broke at once: even with retrieval solved, models finish only about half of a multi-node target set, the search recipe spirals, and the two models invert for the first time in sixteen studies. The fix is app-side decomposition into single-target edits."
date: 2026-07-10T16:00:00Z
draft: false
tags: [ai, agents, llm, benchmark, barkup]
image: https://lj-01.nyc3.cdn.digitaloceanspaces.com/images/blog/teacher.webp
imageDescription: A watercolor painting of a crocodile schoolmaster in a green flat cap, green coat, and red tie, standing upright and reading aloud from an open book held in both claws
author: Kevin Peckham
quote:
  text: "You do not need to construct fake message history. You need a paragraph in your system prompt."
  attribution: Kevin Peckham, Principal at Lightning Jar
glossary:
  - term: Worked example
    definition: "A canned demonstration of the patch dialect placed in the model's context: a view of a tree, an edit request, and the correct patch, unit-tested so the example cannot teach a wrong lesson."
  - term: Stateless session
    definition: A multi-turn editing arrangement in which every turn is a fresh single-turn conversation containing only the current view of the tree and the instruction, with no accumulated conversation history.
  - term: Fan-out edit
    definition: A single instruction that targets every node of one type inside one named container, such as "set the text style to serif on every text-atom inside the section named atlas", so one request requires edits to many nodes at once.
  - term: Content search tool
    definition: "The find_nodes tool tested in Study N: the model supplies a few search words and gets back the five best-matching nodes rendered in place in the skeleton view, backed by a deliberately simple deterministic keyword overlap scorer."
  - term: Pre-registered benchmark
    definition: A benchmark whose hypotheses, prompts, corpus seeds, and grading are committed to version control before any scored run, so the design cannot be tuned after the fact to flatter the result.
additionalReading:
  - title: "We Tried to Delete the Hard Parts. The Benchmark Said No."
    url: "/blog/the-benchmark-said-no"
  - title: "Then We Found the Cheap Part: One Search Call Grounds LLM Tree Edits"
    url: "/blog/then-we-found-the-cheap-part"
  - title: "Your Agent's Session Is Drifting (and the Fix Is Cheaper Than the Bug)"
    url: "/blog/your-agents-session-is-drifting"
  - title: "barkup 0.4: The Model Finds the Node Now"
    url: "/blog/barkup-0-4-content-search"
  - title: "Stable IDs Are All You Need: Seven Studies on Letting LLMs Edit Trees"
    url: "/blog/stable-ids-are-all-you-need"
  - title: "barkup-bench on GitHub: pre-registration, corpus, and raw analysis"
    url: "https://github.com/kevinpeckham/barkup-bench"
---

[barkup-bench](https://github.com/kevinpeckham/barkup-bench) is our
open, pre-registered benchmark series on a narrow question with
broad consequences: what is the most reliable way to let an LLM
agent edit structured data, like page layouts, document templates,
and other typed trees? If you are new here,
[Stable IDs Are All You Need](/blog/stable-ids-are-all-you-need)
summarizes the whole arc.

Three times now, this series has told you to keep your session
history. Study K showed sessions drift without a fresh view of the
tree each turn. Study M showed that even with that fresh view,
deleting the conversation history triples your corrupted sessions.
Study O printed exact position numbers on every node and the
stateless models still misplaced their inserts, which ruled out the
obvious explanation that history was helping the model count.

That left a stranger hypothesis. Maybe history is not a memory at
all. The model does not need to remember what it did to the tree,
because the view already shows the tree. Maybe what twelve turns of
conversation actually provide is a pile of worked examples: here is
what an edit request looks like, here is what a correct patch looks
like, here is how "make it the 3rd child" translates into this patch
dialect's anchors. If that is the mechanism, you should be able to
fake it. Not with the session's own past, but with anyone's past.
Two canned examples from a tree the model has never seen.

## Study P: the forgery works

We wrote exactly two worked examples: one ordinal insert and one
ordinal move (the two operations that produced every stateless
failure), on a fixed ten-node example tree that appears nowhere in
the corpus. Each example is a view, an edit request, and the correct
patch, and the patches are unit-tested so the examples cannot teach
a wrong lesson. Then we re-ran the stateless sessions two ways:
examples injected as fake conversation turns before every step, and
examples pasted as plain documentation into the system prompt.

Both passed the pre-registered gate, on both models. Against full
conversation history, the worst paired difference anywhere was two
steps out of 240. Sessions ending byte-perfect went from 13 or 14
out of 20 (stateless) back to 18 to 20 out of 20 (stateless plus
examples), which is full-history territory. On the cheap model the
examples arm was descriptively the best session configuration we
have ever measured: every late-session placement correct, every one
of its 20 sessions ending byte-perfect. A side mystery from Study M
also closed: without conversational precedent, gemini's replies had
ballooned to six times their normal length; with two examples in
context, they came back down to normal.

And the two framings tied. The system-prompt version did just as
well as the fake-turns version, which means the value is the
content, not the theater of a conversation. You do not need to
construct fake message history. You need a paragraph in your system
prompt.

The practical arithmetic: a stateless session with examples costs a
flat ~2,100 input tokens per step, forever, with no context ceiling
and no history-construction code to get wrong (recall that the
worst bug in this whole series was history construction). At twelve
edits that is about half the tokens of keeping history. At fifty
edits it is a rounding error against history's growth, because
there is no growth.

So the session recipe, revised for the last time in this arc:
persist the tree in your application, render a fresh minimal view
every turn, and put two worked examples of your patch dialect's
tricky operations in the system prompt. History still works. It is
just no longer necessary, and it is not what we thought it was.

## Study Q: then we asked for eight edits at once

Every task in this series had edited exactly one node. Real
requests fan out: "set the text style to serif on every text-atom
inside the section named atlas." We owed the shipped recipe a
stress test against that shape, so we built one: 45 tasks on the
same large trees, each targeting every node of one type inside one
named container, from 2 targets up to 32.

Fan-out broke everything. Not just our search recipe. Everything.

- With retrieval solved completely (every target visible in a
  focused view), success fell to 62 to 69% overall and roughly 45%
  at 7+ targets, against 87 to 100% on single edits. Every one of
  those failures was partial coverage: a legal, validated patch
  that simply stopped before finishing the target set.
- The shipped search recipe failed its gate. On the cheap model it
  lost to the full tree by 24 points, and the lovely single-target
  economics (median one search call, ~5k tokens) turned into a
  spiral: a median of six searches, and a third of runs burning
  over 100k input tokens.
- And for the first time in sixteen studies, the two models
  inverted. Sonnet did significantly better seeing a focused view
  than the whole tree. Gemini did significantly better seeing the
  whole tree than the view, and beat sonnet at whole-tree fan-out
  by 31 points. Until now, every recipe in this series worked on
  both tiers. This one is model-dependent no matter which context
  strategy you pick.

The guidance that survives is decomposition, and it is pleasingly
boring. Your application can enumerate "every text-atom inside
atlas" deterministically, in one tree traversal, without a model.
So do that, and then issue one single-target edit per node, which
is the case we know runs at 87 to 100% on both tiers at every size
tested. More model calls, but each one small, cheap, and reliable.
Asking one prompt to edit N nodes is, on current models, asking for
roughly half of N.

Update, two days later: we ran the decomposition advice through the
same benchmark (Study R), alongside prompt-side alternatives (a
worked fan-out example and an explicit coverage checklist). The
prompt tricks did not rescue fan-out; teaching one complete example
did not transfer to exhaustiveness the way it transferred to
placement. Decomposition did better than we claimed: 90 of 90 tasks
on both models, including every task with 7 to 32 targets, with 674
of 674 single-target subtasks succeeding and total input costs about
a third of showing the whole tree once. The boring answer is now the
measured answer, and its enumeration step now ships as `selectNodes`
in [barkup 0.5](/blog/barkup-0-5-deterministic-selection).

## What we make of the pair

One study replaced a memory with a paragraph. The other found the
first task shape where model choice flips the right answer. Both
are now in the [REPORT](https://github.com/kevinpeckham/barkup-bench)
with pre-registrations (BRIEF-P, BRIEF-Q), audited records, and the
worked examples themselves, unit tests included. The
[barkup](https://www.npmjs.com/package/@kevinpeckham/barkup) docs
carry both updates: the example block as session guidance, and the
fan-out boundary as an honest limit on the 0.4 search recipe.
Combined cost of both studies: about thirty dollars. Sixteen
studies in, the benchmark keeps being cheaper than the opinions it
replaces.
