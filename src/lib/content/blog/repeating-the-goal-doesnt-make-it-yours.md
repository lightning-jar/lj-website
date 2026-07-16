---
title: "Repeating the Goal Doesn't Make It Yours"
metaTitle: "Repeating the Goal Doesn't Make It Yours | barkup-bench Study AF"
slug: repeating-the-goal-doesnt-make-it-yours
description: "One clause in our shipped prompt rules had been living on an inference: before a goal-directed rewrite, restate the goal in your own words. It sounds like obvious good hygiene, the LLM equivalent of repeating an order back at a drive-through. Study AF measured it with our judge-graded protocol, and the result is the cleanest refutation in the series. Made to restate a goal it had read from the document, every model complied perfectly, ninety times out of ninety, and then lost every single decisive comparison to a model that was simply told the goal. Zero wins. The model says the goal accurately, in its own words, and then writes the wrong paragraph anyway. Where a goal comes from matters more than whether the model says it aloud, and one more obvious-looking prompt clause turns out to be theater."
date: 2026-07-16T14:00:00Z
draft: true
tags: [ai, agents, llm, open-source, barkup, benchmarks]
image: https://lj-01.nyc3.cdn.digitaloceanspaces.com/images/blog/parrot.webp
imageDescription: A watercolor painting of a green parrot perched on a branch, beak open mid-phrase
author: Kevin Peckham
quote:
  text: The model restated the goal perfectly, ninety times out of ninety. Then it wrote the wrong paragraph anyway. Verbalization is not the active ingredient.
  attribution: Kevin Peckham, Principal at Lightning Jar
glossary:
  - term: Judge-graded (Track 2)
    definition: "Our protocol for questions with no deterministic grader: pairwise comparisons against a control, both presentation orders, verdicts only when the orders agree, and judges that must pass a fifty-pair calibration exam with planted answers before grading anything real. Track 2 numbers are never pooled with the deterministic studies."
  - term: Restate-before-rewrite
    definition: "The clause under test: before a goal-directed rewrite, restate the goal in your own words. Shipped on an inference after Study V; measured here."
  - term: Views carry values, memos carry goals
    definition: "Study V's finding: a model shown the document node its goal lives in reads it and still writes measurably less focused prose than a model told the goal in the instruction or an application memo. Study AF hardens this from a heuristic into a mechanism claim."
  - term: Compliance
    definition: "Whether the model actually performed the restatement, detected deterministically by a registered GOAL-line format. It was perfect in every cell, which is what makes the failure informative: the ceremony happened, and it did nothing."
additionalReading:
  - title: "Views Carry Values, Memos Carry Goals"
    url: "/blog/views-carry-values-memos-carry-goals"
  - title: "Hand It Everything It Needs: 23 Pre-Registered Studies on LLM Document Editing"
    url: "/blog/hand-it-everything-it-needs"
  - title: "The Builder's Playbook: ten measured guidelines for LLM document-editing apps, with code examples"
    url: "/research/barkup-bench/playbook"
  - title: "barkup-bench research dashboard"
    url: "/research/barkup-bench"
  - title: "barkup-bench on GitHub: pre-registration, corpus, and raw analysis"
    url: "https://github.com/kevinpeckham/barkup-bench"
---

[barkup-bench](/research/barkup-bench) is our open, pre-registered benchmark series on how LLM agents should edit structured documents. This entry is from its judge-graded track, which we keep separate from the deterministic studies and label loudly, because "which paragraph is better" has no unit test. What it does have is a protocol: pairwise comparisons against a control, both presentation orders, verdicts only when the orders agree, and judges that re-passed a fifty-pair calibration exam with planted answers before grading a single real comparison. Both judges went fifty for fifty.

The subject is one sentence of our own prompt engineering that had been living on an inference. When Study V found that memos carry qualitative goals at full parity while views do not (a model shown the document node its goal lives in reads it and still writes measurably less focused prose, losing 117 of 120 judged comparisons), we shipped a memo rule that included a plausible-sounding clause: restate a goal from the memo in your own words before a goal-directed rewrite. It sounds like obvious hygiene. Humans do it. Waiters repeat your order back. Pilots read back clearances. Surely making the model say the goal out loud binds it to the goal.

We flagged the clause as inferred-not-measured the day we shipped it, and it has been sitting in the ledger as the series' one unaudited sentence ever since. Study AF is the audit.

## The experiment

Two questions, one registered clause. First, the ambitious version: if restatement is the active ingredient, it should rescue Study V's sharpest loss. So one arm shows the model the document node the goal lives in (Study V's losing configuration, verbatim) and adds the clause, operationalized so compliance is deterministically checkable: begin your reply with a line starting GOAL: that restates the goal in your own words, then give the patch. Second, the shipped version: the memo carries the goal (Study V's winning configuration, verbatim) plus the same clause. Both arms run against a same-batch control that is simply told the goal in the instruction, thirty tasks each, three editors: sonnet, gemini, and opus, the last of which had no qualitative data at all until now.

Every one of the 270 edits was mechanically valid. Every one of the 180 restate-arm replies included a compliant GOAL line. Whatever happens next, it is not a story about disobedience.

## The result: perfect compliance, zero wins

The view arm, the one restatement was supposed to rescue, lost every decisive comparison on every editor. Zero wins, seventy-nine losses, eleven ties, across sonnet, gemini, and opus alike, confirmed by both judges. The models read the mission node, restated the thesis accurately in their own words, and then wrote the same measurably-less-focused paragraph they would have written without the ceremony. Our keyword proxy makes the sequence painfully visible: the GOAL lines are on-thesis, and the rewrites drift anyway.

Sit with how strange that is for a moment. The model demonstrably has the goal. It can articulate the goal. It has just articulated the goal, in the same reply, inches above the patch. And the paragraph it then writes anchors to that goal measurably worse than if the goal had arrived one message earlier from the outside. Repeating the goal does not make it yours. Where a goal comes from matters more than whether you say it aloud.

Study V's slogan, views carry values and memos carry goals, was a heuristic about where to put things. It is now a mechanism claim: there is no prompt ritual that converts reading into being told. We tested the most plausible candidate ritual, at perfect compliance, and it moved nothing.

## The shipped clause survives its gate, barely, and loses its job

On the memo path, where the clause actually ships, the registered gate passes: with the goal in the memo, adding mandated restatement holds parity with the explicit-goal control on all three editors under the primary judge. No significant harm. But we disclose the rest loudly, because it all leans one direction. Under the sensitivity judge, the restate arm is significantly control-favored on two of three editors. And where Study V's bare memo had beaten the control outright on sonnet, ten wins to two, memo-plus-restate merely ties.

So the honest synthesis is not "validated." It is: the clause does no measurable good anywhere, and the evidence trends toward a whisper of harm. Its motivating hope (the view-side rescue) is refuted at zero for ninety. The benchmark's recommendation, now filed with the production codebase, is to remove the sentence. The memo it decorates is untouched: its goal-carriage parity replicated contemporaneously in this study, on a third model tier. The memo works. The ceremony on top of it is theater.

## What this changes for builders

Concretely, two things. If your prompt rules tell the agent to restate, summarize, or "think about" a goal it read from the artifact before acting on it, you are spending tokens on something we just measured at zero across ninety comparisons and three model tiers. Put the goal in the instruction or an application-maintained memo instead; that is the part that measures.

And more generally, this is the second time this series has caught an obviously-right prompt clause doing nothing. A priority meta-rule everyone would have bet on moved nothing in our conflict studies. Now read-back verbalization, the most human-intuitive ritual there is, moves nothing either, at perfect compliance. The pattern is worth internalizing: clauses that dramatize reasoning are not the same as context that changes it. Obvious is not measured, and shipped-on-an-inference deserves an audit date.

The usual caveats travel with the numbers, plus Track 2's own: judge-graded verdicts, one grammar, thirty tasks per cell, one rewrite genre, and a 66.7% raw agreement rate between judges driven by the tie-heavy memo cells, with no gate verdict flipped by the second judge on the view side. Everything is reproducible from the [benchmark repo](https://github.com/kevinpeckham/barkup-bench), pre-registration first, judge calibration records included, and the chart set lives on the [research dashboard](/research/barkup-bench#sec-restate). Thirty-two studies in, the ledger of unaudited sentences in our shipped prompts is, for the first time since we started counting, empty.
