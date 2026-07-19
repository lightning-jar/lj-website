---
title: "It Asked About Things It Already Knew"
metaTitle: "It Asked About Things It Already Knew | barkup-bench Study AG"
slug: it-asked-about-things-it-already-knew
description: "The ask path had one unmapped border left: dangling references. 'Undo that' against an editor with no context used to produce a valid, silently wrong patch 144 times out of 144. We pointed the shipped permission sentence at it, and the border closed on every tier: 138 of 144 silent guesses became questions that named the missing antecedent precisely. Then the tax check failed on all three models, and the failure is a small masterpiece of letter-following. With an echo supplying everything needed, the node id, the attribute, both values, the models quoted that information back to us and asked anyway, because the sentence says a node that is not visible warrants a question, and the target sat outside a skeleton view. An anchored patch needs only the id. They had the id. They asked. The hatch's famous zero tax turns out to be conditional on the view contract it rides along with, which makes them one system, not two features."
date: 2026-07-16T22:00:00Z
draft: false
tags: [ai, agents, llm, open-source, barkup, benchmarks]
image: https://lj-01.nyc3.cdn.digitaloceanspaces.com/images/blog/dog-with-ball.webp
imageDescription: A watercolor painting of a golden labrador lying down with a pink ball in its mouth, looking up at the viewer
author: Kevin Peckham
quote:
  text: They quoted the node id from the echo, then asked to see the node. The patch needed only the id. The letter of the rule beat the point of the rule, again.
  attribution: Kevin Peckham, Principal at Lightning Jar
glossary:
  - term: The discourse gap
    definition: "Follow-up requests that point at the previous edit ('undo that', 'the same node's title'). Against an editor with no carrier for that context, they failed 0 of 144 in Study X, every failure a valid silently-guessed patch."
  - term: Last-edit echo
    definition: "One app-generated line describing the previous applied edit (node, attribute, old and new values), attached to each request. Study X's measured fix: it solved the discourse gap 48 of 48 per model without any model judgment involved."
  - term: The visibility clause
    definition: "The part of the shipped ask sentence covering 'a node that is not visible in the view.' Correct and free when views carry every mentioned node; under skeleton views it converts solvable, fully-specified edits into questions."
  - term: Skeleton view
    definition: "A minimal rendering showing document structure but not the target node's detail. Study X's anaphora steps used them deliberately, so the carrier under test had to supply everything. Anchored patches do not require the target to be visible, only its id."
additionalReading:
  - title: "Undo That: The One-Line Echo That Replaces a Transcript"
    url: "/blog/undo-that"
  - title: "Only the Frontier Knows When to Ask"
    url: "/blog/only-the-frontier-knows-when-to-ask"
  - title: "The Model Always Knew What It Couldn't See"
    url: "/blog/the-model-always-knew"
  - title: "The Builder's Playbook: ten measured guidelines for LLM document-editing apps, with code examples"
    url: "/research/barkup-bench/playbook"
  - title: "barkup-bench research dashboard"
    url: "/research/barkup-bench"
  - title: "barkup-bench on GitHub: pre-registration, corpus, and raw analysis"
    url: "https://github.com/kevinpeckham/barkup-bench"
---

[barkup-bench](/research/barkup-bench) is our open, pre-registered benchmark series on how LLM agents should edit structured documents. Its ask-path story has run four studies now. First we learned that silent guessing was obedience, not blindness, and that one sentence of permission ends it at hard boundaries. Then we walked that sentence down an ambiguity ladder and found its edges: zero tax on clear requests, a perfect answer loop, and a tier split where only the frontier model recognizes a two-way ambiguity as ask-worthy. Then we measured the obvious fix for that split and left it unshipped.

One border remained unmapped, and it was the oldest one: the discourse gap. "Undo that." "Set that same node's title." Requests that point backward at context the model does not have. Study X measured this construction at its bleakest: against a carrier-less editor, 144 attempts produced 144 valid, applied, silently wrong patches. Not one refusal, not one question. We fixed it the app-side way, with a one-line echo describing the previous edit, and shipped that. But the ask sentence was never pointed at this construction, and there was a real reason to think it would work here where it had failed on ambiguity: a dangling "that" is information that is *not stated in the request*, which is precisely the letter of the sentence.

## The border closes

It works. Better than works: with the shipped sentence and no other help, 138 of the 144 formerly silent cells became questions, on every tier. Opus asked 48 of 48, sonnet 47, gemini 43. The contemporaneous control replicated Study X to the digit, all 144 cells silent again, so the delta is the sentence and nothing else.

And these are not vague hedges. The asks name the wound: "the request refers to 'that same node' from a prior instruction, but no such node is identified in the request or visible in the current view; I would need the id of the target node." That is a model correctly diagnosing a dangling anaphor and requesting exactly the antecedent. Unlike the ambiguity border, where the mid tiers read the sentence's letter and marched past the gap, the discourse gap sits squarely inside the letter, and every tier protects itself. The map is complete: the hatch covers absence everywhere, discourse gaps everywhere, and ambiguity only where capability supplies the judgment.

If we had stopped there, this would be a victory lap. We did not stop there, because the study's second arm existed to check the price, and the price check failed on all three models.

## The fine print

The second arm ran the same cells with the last-edit echo attached, the shipped fix from Study X. The echo hands the model everything: the node id, the attribute, the old value, the new value. With the echo and no hatch, models solve these cells 48 of 48. Adding the hatch should change nothing, because nothing is missing.

Instead, the models asked on roughly seventy percent of the cells. And their asks are a small masterpiece of letter-following: "The text-atom with id n58 is not visible in the current view. I need to see this node to set its content attribute." Read that twice. The model has the id. It has the attribute. It has the value it intends to write. It quotes them all, correctly, from the echo. An anchored patch requires nothing else, which is the entire reason the echo worked perfectly in Study X. But the sentence says a node that is not visible in the view warrants a question, the anaphora cells deliberately use skeleton views where the target is not visible, and so the model asks about a node it could already edit.

No model was confused. Every ask demonstrates complete knowledge of the task. The letter of the rule beat the point of the rule, on every tier, including the frontier one, thirty-three times out of forty-eight even for opus. Meanwhile the same arm's ordinary steps, whose views carry their targets, produced zero false asks in 288 cells. The trigger is not the hatch, and not the echo. It is the combination of the sentence's visibility clause with a view protocol that legitimately leaves targets unseen.

## One system, not two features

Here is the useful way to say what we learned. The hatch's zero-tax record, measured three separate times now, was always conditional on something we had been shipping alongside it without noticing the dependency: the focus-ids contract, our rule that a view must contain every node a request mentions. Where that contract holds, the visibility clause never fires falsely, because anything the model should touch is on screen. Where the contract is deliberately relaxed, in skeleton or outline protocols, the clause converts solvable requests into interviews.

So the hatch and the view contract are one system, not two features you can adopt independently. If you ship the ask sentence, either your views carry their targets, or your agent has a self-serve view tool so that fetching beats asking (our production template editor has exactly that, which is why this finding is a fence for it rather than a fire), or you write a re-scoped sentence and measure it before shipping, because this series has now caught prompt clauses doing the unexpected in four separate studies, and "obviously right" has a losing record here.

The echo, for its part, remains exactly what Study X said it was: the correct fix for the discourse gap, zero questions, perfect solves, no model judgment required. The hatch behind it is a real seatbelt now, measured on every tier. We just know, at last, what the seatbelt costs and when: nothing, so long as you keep the promise the rest of the architecture was already making.

The usual caveats travel with the numbers: three models, one grammar, seeded corpora, deterministic grading, 1,296 session steps. Everything is reproducible from the [benchmark repo](https://github.com/kevinpeckham/barkup-bench), pre-registration first, and the chart set lives on the [research dashboard](/research/barkup-bench#sec-anaphora-hatch). Thirty-five studies in, the ask-path map is closed, and its legend has one new symbol: a permission slip that presumes the view.
