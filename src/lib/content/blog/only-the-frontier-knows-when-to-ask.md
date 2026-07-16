---
title: "Only the Frontier Knows When to Ask"
metaTitle: "Only the Frontier Knows When to Ask | barkup-bench Study AE"
slug: only-the-frontier-knows-when-to-ask
description: "Two studies ago we found that one sentence of permission turns silent guessing into precise questions. This study tried to break that sentence, by walking it down a five-level ladder of ambiguity and by answering the questions it produces. The two failure modes everyone worries about never showed up: zero false asks on ninety clear requests, and a perfect 135 of 135 solves after the user replies. The crack is somewhere stranger. When a request matches two visible nodes equally well, the frontier model asks which one you meant, naming both ids, fifteen times out of fifteen. The mid-tier models, with the same permission in the same prompt, ask once in fifteen. One silently edits both nodes. The other silently picks one. Knowing that a question is the right answer turns out to be a capability."
date: 2026-07-15T20:00:00Z
draft: false
tags: [ai, agents, llm, open-source, barkup, benchmarks]
image: https://lj-01.nyc3.cdn.digitaloceanspaces.com/images/blog/wooden-sign-02.webp
imageDescription: A watercolor painting of a blank wooden signpost with arrow points on both ends, pointing two directions at once
author: Kevin Peckham
quote:
  text: The tax was zero. The loop was perfect. The crack is that below the frontier, models resolve ambiguity instead of noticing it.
  attribution: Kevin Peckham, Principal at Lightning Jar
glossary:
  - term: Escape hatch
    definition: "One registered sentence giving the model permission to reply NEED-INFO instead of a patch when it cannot see something the request requires. Study AC measured it perfect at a hard boundary; this study measures where it calibrates and where it does not."
  - term: Ambiguity ladder
    definition: "Five task levels with unit-validated defining properties: precise and solvable, indirectly named but unique, discretionary value, ambiguous referent (a descriptor matching exactly two visible nodes), and provably missing information. The correct behavior is to ask only on the last two."
  - term: False ask
    definition: "Asking for information the model already has. The tax side of the ledger, and the reason teams hesitate to ship ask paths. Measured across ninety clear-request cells: zero."
  - term: Resume loop
    definition: "What happens after an ask: the user answers in plain text and the model must integrate the value into a correct edit. Measured at 135 of 135 with zero repeat questions and zero wrong integrations."
additionalReading:
  - title: "The Model Always Knew What It Couldn't See"
    url: "/blog/the-model-always-knew"
  - title: "Hand It Everything It Needs: 23 Pre-Registered Studies on LLM Document Editing"
    url: "/blog/hand-it-everything-it-needs"
  - title: "The Builder's Playbook: ten measured guidelines for LLM document-editing apps, with code examples"
    url: "/research/barkup-bench/playbook"
  - title: "barkup-bench research dashboard"
    url: "/research/barkup-bench"
  - title: "barkup-bench on GitHub: pre-registration, corpus, and raw analysis"
    url: "https://github.com/kevinpeckham/barkup-bench"
---

[barkup-bench](/research/barkup-bench) is our open, pre-registered benchmark series on how LLM agents should edit structured documents. Two studies ago it produced the series' most quotable result: the silent guessing that haunted twenty-eight studies was never blindness, it was obedience. Give a model one sentence of permission to ask, and it asks on every provably-unsolvable task, names the exact missing node, and never asks when it has what it needs ([the write-up](/blog/the-model-always-knew)).

We shipped that sentence to production surfaces the same week. And we shipped it with two disclosed fears, because the study that validated it had tested it only on its home turf, where every unsolvable task was provably, unambiguously unsolvable. Fear one: on ordinary vague requests, the hatch might turn an editing agent into an interviewer, taxing every user with questions the model could have answered itself. Fear two: we had graded the asks but never the aftermath. An ask that dead-ends, or that the model fumbles after the user replies, would be worse than no ask at all.

Study AE tried to realize both fears on purpose.

## The ladder

The experiment walks the shipped sentence, frozen verbatim, down a five-level ladder of ambiguity. Fifteen tasks per level, every level's defining property validated by unit tests before any model call, two arms (with and without the hatch), three models.

At the bottom, level zero: precise, fully solvable requests, where asking would be pure tax. Level one: the target named indirectly ("the text-atom whose maxLength is 114") but uniquely, resolution the model's job, value stated. Level two: the target named exactly, the value left to judgment ("make the content of n144 punchier"), where a literal-minded hatch might demand a style brief. Level three: a singular request whose descriptor matches exactly two visible nodes with different current values, so no amount of reading resolves which one the user meant. Level four: the value provably absent, the construction from the original study.

The correct behavior is a step function: act on the bottom three levels, ask on the top two.

Separately, the resume loop: forty-five unsolvable tasks per model where, when the model asks, the harness answers as the user would, in one plain sentence, and the conversation continues. No view re-attachment, no ceremony. Just the answer, the way a person types it.

## The two fears, refuted at ceiling

The tax never appeared. Across ninety clear-request cells with the hatch present, three models produced zero false asks, with solve rates identical to the no-hatch control. The indirect references got resolved, not questioned. And "make it punchier" got edited on the spot, forty-three times in forty-five, with no interviews about tone (the frontier model asked about wording twice; we disclose it and shrug). Whatever image you had of a permission-slip sentence turning your agent into a bureaucrat, the data declines to support it.

The dead-end fear did worse. Every single ask, once answered, became a correct edit: 135 of 135 across all three models, zero repeated questions, zero cases of the model taking the answer and applying it wrong, zero correction rounds needed. The model asks about the value it cannot see, receives one conversational sentence, and lands the exact patch. If you have been hesitating to wire an ask path because you weren't sure the second turn would work, stop hesitating. The second turn is the reliable part.

## The crack, and it is not where anyone looked

Level three is where the study earns its keep. Two visible nodes match the request equally well. The current values differ, so the choice matters. The request is singular, so editing both is wrong, and reading harder does not help, because the ambiguity is in the request, not the document.

The frontier tier does exactly what you would want. Opus asked on fifteen of fifteen, and every one of its questions named both candidate ids: which of these two did you mean? That is a perfect score on a construction it had never seen, from a sentence that does not mention ambiguity at all.

The mid tiers do not. Sonnet and gemini, with the identical sentence in the identical prompt, asked once each in fifteen. The other fourteen times they resolved the ambiguity themselves, and they resolved it differently, which is its own small horror. Sonnet's habit is to edit both matching nodes, a defensible reading of a plural that this request is not. Gemini's habit is to silently pick one, the pure coin-flip, valid and applied and wrong half the time by construction.

The mechanism is almost embarrassingly textual. The shipped sentence grants permission to ask about what is "not visible in the view and not stated in the request." An ambiguous referent is entirely visible. Opus generalized the rule's intent: when I cannot know what the user wants, ask. The mid tiers applied its letter: I can see everything, so I must patch. If that pattern sounds familiar, it should. Our conflict studies found the same shape, with the same models: the strongest tier reads intent where weaker tiers read text. Knowing when a question is the right answer is, on this evidence, a capability, not a prompt feature.

## What this changes for builders

If you run a frontier Claude tier, the ask path you shipped just got better than advertised: it covers missing information and ambiguous references, it costs nothing on clear requests, and the answer loop is measured at ceiling. Wire the reply path and trust it.

If you run below the frontier, or your traffic can fall back there, the fence matters: the hatch catches absence, not ambiguity. Requests that could mean two things will get silently resolved, not questioned, and your only defense is making ambiguity impossible upstream: unique references, deterministic enumeration for bulk edits, selection grounding so the app knows which node the user is looking at.

And the obvious fix, adding "or if the request matches more than one node, ask which" to the sentence? It stays unshipped until a registered test passes it. We have been burned before by prompt clauses that looked obviously right: our conflict studies measured a priority rule everyone would have bet on, and it did nothing. Obvious is not measured.

The usual caveats travel with the numbers: three models, one grammar, seeded corpora, fifteen cells per level per model, deterministic grading throughout. Everything is reproducible from the [benchmark repo](https://github.com/kevinpeckham/barkup-bench), pre-registration first, and the chart set lives on the [research dashboard](/research/barkup-bench#sec-calibration). Thirty-one studies in, the ask path has graduated from a promising sentence to a mapped territory, with one honest border drawn where capability ends.

Update, July 2026: the obvious fix got its measurement (Study AI). One added sentence covering requests that match more than one node, tested against the shipped sentence across the whole ladder. It rescued sonnet completely (3 of 15 asks became 15 of 15, every ask naming both candidates), moved gemini from 0 to 11 of 15 but one ask short of the registered bar, with its four residual failures all silently editing both matches, and taxed nothing anywhere: zero false asks on ninety clear requests. On the tier that ships, it added nothing (opus was already perfect) while slightly increasing interrogation of discretionary requests. So the clause stays unshipped where we run, the capability framing above survives its third test, and app-side disambiguation remains the actual contract. Charts on the [dashboard](/research/barkup-bench#sec-multiplicity).
