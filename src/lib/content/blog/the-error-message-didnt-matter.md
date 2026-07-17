---
title: "The Error Message Didn't Matter"
metaTitle: "The Error Message Didn't Matter | barkup-bench Study AJ"
slug: the-error-message-didnt-matter
description: "For thirty-five studies, one mechanism rode along in every arm of our benchmark without ever being tested: when a model's patch fails validation, we return the structured issues verbatim for a correction round. It felt obviously load-bearing. Study AJ finally isolated it, by seeding known failures and varying only the feedback text: the full structured issues, bare issue codes, or nothing but 'the anchored patch was invalid.' The result is parity on all three models. Opus recovered 45 of 45 in every arm, including from the bare sentence. Gemini scored an identical 42 of 45 in every arm, missing the same three cells each time no matter what we told it. Told a patch failed, models simply re-derive the correct edit from the task and the tree. The verbatim-issues commitment survives with its rationale corrected: it is developer UX, not model recovery. The error message was for us."
date: 2026-07-17T16:00:00Z
draft: false
tags: [ai, agents, llm, open-source, barkup, benchmarks]
image: https://lj-01.nyc3.cdn.digitaloceanspaces.com/images/blog/boy-commanding-bunny.webp
imageDescription: A vintage illustration of a small boy in a top hat, red bow tie, and red suspendered shorts pointing a commanding finger at an attentive rabbit standing on its hind legs
author: Kevin Peckham
quote:
  text: We told the model exactly what was wrong, every study, for months. Then we tried telling it nothing but "that was invalid." It fixed the patch anyway.
  attribution: Kevin Peckham, Principal at Lightning Jar
glossary:
  - term: The correction loop
    definition: "barkup's retry mechanism: when a model's patch fails validation, the validator's issues are sent back and the model replies with a corrected patch. Shipped with up to three rounds; Study AJ measured a single round."
  - term: Structured issues
    definition: "The validator's full diagnostic output, returned verbatim: the issue code, the node id and path involved, and a human-readable message per problem. A design commitment present in every arm of every prior study."
  - term: Seeded failure
    definition: "A known-correct patch corrupted by a registered operator (a dangling id, a missing field, a malformed op kind, a bad placement anchor, an unknown attribute), injected into the transcript as the model's own prior turn, and confirmed to fail the shipped applier before any scored call."
  - term: Discordant pairs
    definition: "Cells where two arms disagree (one recovered, the other did not), the only cells McNemar's test counts. Gemini produced zero across 45 paired cells: the same three failures in every arm, so feedback quality demonstrably changed nothing."
additionalReading:
  - title: "The Twenty-First Note"
    url: "/blog/the-twenty-first-note"
  - title: "Hand It Everything It Needs, Then Trust It"
    url: "/blog/hand-it-everything-it-needs"
  - title: "The Builder's Playbook: ten measured guidelines for LLM document-editing apps, with code examples"
    url: "/research/barkup-bench/playbook"
  - title: "barkup-bench research dashboard"
    url: "/research/barkup-bench"
  - title: "barkup-bench on GitHub: pre-registration, corpus, and raw analysis"
    url: "https://github.com/kevinpeckham/barkup-bench"
---

[barkup-bench](/research/barkup-bench) is our open, pre-registered benchmark series on how LLM agents should edit structured documents. This entry is a self-audit, and it is the purest one we have run, because the mechanism under test was not a hypothesis we shipped and doubted. It was a commitment we believed in so thoroughly that in thirty-five studies we never once thought to vary it.

When a model's patch fails validation, barkup returns the validator's structured issues verbatim and asks for a corrected patch. The issue code, the offending node id, the path, a human-readable message per problem. This has been baked into every arm of every study, it closes guideline 01 of our playbook, and our production guidance states it as a rule: send the issues back verbatim. The belief behind it is intuitive to the point of feeling unfalsifiable. Of course a model corrects better when you tell it exactly what was wrong. Nobody debugging anything has ever asked for a vaguer error message.

But intuitive is not measured, and this particular mechanism had a distinguishing property: it was the only shipped mechanism in the whole architecture that had never been an experimental variable. Study AJ fixed that.

## Seeding the failures

There is a reason the correction loop went unmeasured for so long: it rarely triggers. First-pass patch validity in this series runs 84 to 99 percent, so a study that waits for organic failures spends almost all its budget on cells that never reach the loop. The fix is to stop waiting.

We took 45 tasks from the main corpus, derived the known-correct anchored patch for each, and corrupted it with a registered operator from a pre-committed matrix: a dangling node id, a missing required field, a malformed op kind, a placement anchored to a node that can never be a sibling, an unknown attribute key. Each corrupted patch was validated to fail the shipped applier before any scored call. Then the trick that makes it a correction loop rather than a quiz: the corrupted patch was injected into the transcript as the model's own prior turn. From the model's perspective, it made this mistake, and the app is responding.

The response is the entire experiment. One feedback message, then one reply, graded. Three arms, differing only in that message:

The structured arm sends the full issues, verbatim, exactly as every prior study did. The codes arm sends only the issue codes, a diagnostic skeleton with the ids and messages stripped out. The bare arm sends thirteen words: "The anchored patch was invalid," plus the shared retry instruction and nothing else. No codes, no ids, no hint of what went wrong.

The pre-registered gate: the commitment earns its keep if structured feedback significantly beats bare feedback on at least two of three models.

## It didn't matter

Structured beat bare on zero of three models.

Opus recovered all 45 seeded failures in every arm. Given nothing but "the anchored patch was invalid," it looked back at the task, the tree, and its own broken patch, and produced the correct edit 45 times out of 45.

Gemini is the sharper result. It scored 42 of 45 in all three arms, and they are the same three cells every time. Zero discordant pairs: not one cell anywhere in the paired comparison where feedback quality changed the outcome. The three misses all sit in the one genuinely hard corruption class, bad placement anchors, and no amount of diagnostic detail rescued them, and no absence of it created new failures.

Sonnet produced the only gradient in the study, 45 with structured issues, 44 with codes, 42 with bare, and it is not statistically significant. Three discordant cells on a 45-cell corpus is a whisper, and we report it as one.

The class breakdown says the same thing from another angle. Pooled across models, four of the five corruption classes were recovered at 115 of 117 or better in every arm, including bare. Only bad anchors were hard, at 15, 14, and 14 of 18, and the arms are within one cell of each other there too. Difficulty lives in the corruption, not in the feedback.

The mechanism is not mysterious. A failed patch plus the original task plus the original tree is an overdetermined system. The model does not parse your diagnostic and surgically repair the broken field; it throws the broken patch away and re-derives the edit from the request, which it can do because the request and the tree are still right there. The error message is not an input to that process. It is a starting gun.

## The failure that runs the wrong way

One pre-registered hypothesis predicted bare feedback would be worse in a specific, dangerous way: without diagnostics, models would flail into patches that are valid but wrong, the silent-failure mode this series keeps finding elsewhere. That is the one outcome worse than not recovering.

It ran the other way. Every arm produced exactly three valid-but-wrong cells, the same count with full diagnostics as with none. Bare feedback's extra failures, the handful it has, stayed *invalid*: visible, loggable, caught by the applier. Thin feedback did not push models toward plausible wrong fixes. It just occasionally failed to fix, out loud, where your own validation layer sees it.

## Keep it, for the humans

So the commitment survives, with its rationale corrected, and the correction matters more than the survival.

Return the issues verbatim because it costs nothing and because correction transcripts get read by people. An engineer debugging a failed edit at 2am wants the log to say which node id was dangling, not "the patch was invalid, and then it got fixed somehow." That is a real reason, and it is sufficient. What we can no longer say, because we measured it, is that error-message quality is load-bearing for recovery. If a future constraint ever forces a choice between polishing error messages and any guardrail this series has actually validated, the focused-view contract, the precedence clause, the ask hatch, app-side fan-out decomposition, the error messages lose, on the data.

The caveats are disclosed and real. Seeded single-op corruptions are a constructed proxy; organic failures may be weirder, though they are also rarer than this design assumes. Recovery was single-shot, where the shipped loop allows three rounds, and extra rounds could only narrow a gap that already measures as parity. One grammar, one patch dialect.

The meta-lesson is the one this series keeps paying us for. Study AF found that a restatement ritual we shipped did nothing. Study AD found the worked examples we thought were essential are training wheels the frontier tier does not need. Now Study AJ finds the mechanism we were proudest of, the humane, detailed, verbatim error message, is for us, not the model. Three different corners of the architecture, one repeated shape: the parts of a system that feel most obviously valuable are precisely the parts nobody thinks to test. Give your best-justified commitment a control group. Ours has been riding along, unexamined, in every study since the first, and it turned out to be a comment addressed to the developers, written in the voice of an API.

The full pre-registration, corpus, seeded-failure generator, and raw analysis are in the [repo](https://github.com/kevinpeckham/barkup-bench); charts and the arm table are on the [dashboard](/research/barkup-bench#sec-correction).
