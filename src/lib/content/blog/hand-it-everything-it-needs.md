---
title: "Hand It Everything It Needs: 23 Pre-Registered Studies on LLM Document Editing"
metaTitle: "Hand It Everything It Needs | The barkup-bench Capstone at 23 Studies"
slug: hand-it-everything-it-needs
description: "The updated capstone of our open benchmark series. Twenty-three pre-registered studies, more than 19,000 scored model runs, five models, one published correction, and several kept self-refutations later, the question \"how should an LLM agent edit structured documents\" has a measured answer with a number on every component: stable ids, anchored patches, focused views for the values an edit must read, one search call for finding targets, two worked examples instead of conversation history, a memo the agent writes itself for facts and goals, and app-side decomposition for bulk edits. The model is a brilliant executor with no context of its own. Hand it everything the request assumes, and almost nothing else."
date: 2026-07-12T20:00:00Z
draft: true
tags: [ai, agents, llm, open-source, barkup, benchmarks]
image: ""
imageDescription: ""
author: Kevin Peckham
quote:
  text: The recipe is not a clever prompt. It is a division of labor, and every clause of it has a number attached.
  attribution: Kevin Peckham, Principal at Lightning Jar
glossary:
  - term: Pre-registered benchmark
    definition: A benchmark whose hypotheses, task corpora, prompts, seeds, and pass gates are committed to a public repository before any scored model call, so the design cannot be tuned after the fact to flatter the result.
  - term: Anchored patch
    definition: A small edit operation addressing nodes by their stable ids, with placements anchored to sibling ids rather than positional indexes. The only editing interface that held for both frontier and cheap models above roughly 300 nodes.
  - term: Focused view
    definition: A rendering of the document showing only the nodes a request concerns, with everything else collapsed to id-bearing placeholders. Matches full-document accuracy at 1 to 4% of the input cost, provided it includes every node the request mentions.
  - term: Session-notes memo
    definition: A short app-held block recording the facts, standing rules, and goals a user has declared, appended to every request. Replaces conversation history for declared state, carries qualitative goals at full parity, and the agent itself can be trusted to write it.
  - term: Silent failure
    definition: "The recurring villain of the series: a model that cannot know something does not refuse or error. It produces valid, plausible, confidently wrong output — invented values, obliviously polished paragraphs — that no validator or error log will ever flag."
additionalReading:
  - title: "Stable IDs Are All You Need (the original capstone, at seven studies)"
    url: "/blog/stable-ids-are-all-you-need"
  - title: "barkup-bench research dashboard: every chart and data table"
    url: "/research/barkup-bench"
  - title: "Who Writes the Memo? Auditing the Safety Net We Shipped"
    url: "/blog/who-writes-the-memo"
  - title: "barkup-bench on GitHub: pre-registration, corpora, and raw analysis"
    url: "https://github.com/kevinpeckham/barkup-bench"
  - title: "@kevinpeckham/barkup on npm"
    url: "https://www.npmjs.com/package/@kevinpeckham/barkup"
---

A month ago we started measuring a narrow question with broad consequences: what is the most reliable way to let an LLM agent edit structured documents, the typed trees behind page builders, document templates, and CMS content? The method was borrowed from fields that learned it the hard way: every study pre-registered by commit before the first scored model call, pass gates stated in advance, deterministic unit-tested graders, seeded corpora, and results published as found, including the ones that embarrassed us.

Twenty-three studies, more than 19,000 scored runs, and five models later, the answer is not a clever prompt. It is a division of labor. The model is a brilliant executor with no context of its own; the application owns the context. Hand the model everything the request assumes, and almost nothing else. Here is that recipe with a number on every clause, followed by the part we think matters more: what we got wrong along the way, and published anyway.

## The architecture, one measured clause at a time

**1. Give every node a permanent id.** The foundation everything else stands on. Across the entire series, zero failures were ever caused by a model mangling a stable id.

**2. Edit by id-anchored patches, not whole-document rewrites.** At small sizes every id-stable interface ties. Above roughly 300 nodes, anchored patches are the only interface both model tiers hold: 87 to 100% where whole-document rewrite falls to 0 to 80% on the cheap tier, at about $0.26 and 4 seconds per solved 1000-node edit versus $0.88 and 10 minutes. Positional patches (RFC 6902) decay toward 10%. Never make the model reproduce what it is not changing.

**3. Show a focused view, and make it cover every node the request mentions.** A ~1.5k-token view of the relevant region matches full-document accuracy at 1 to 4% of the input, and view size scales with tree depth, not document size. But the focus list is a correctness contract: an edit that must read a second node, given a view showing only the target, does not fail. It silently invents a plausible value, 90 times out of 90 in our test, with zero refusals. Include every mentioned node and the score returns to 90 of 90, at 25 times less input than the whole document.

**4. When the user doesn't name a node, give the model one search call.** A skeleton view plus a deterministic keyword-search tool grounds plain-language requests at oracle-level accuracy on the frontier tier, at a median of exactly one call and a tenth of the input. Embeddings measured no better than keyword overlap for structural references. Navigation tools were a trap: oracle accuracy on the frontier model at higher cost than showing everything, collapse on the cheap one.

**5. Replace session memory with two worked examples.** What conversation history actually contributes to an editing session is teaching, not memory: two canned examples of the patch dialect's tricky operations, about 900 tokens in the system prompt, restore stateless sessions to full-history accuracy. Measured through 36-edit sessions with no decay, edit 36 taught as well as edit 1, at flat ~2.1k input per step while keep-history grows linearly to 24k.

**6. For everything the user declares, keep a memo, and let the agent write it.** Requests that depend on earlier conversation ("rename it to the codename we settled on") fail stateless editors 100% of the time by construction. A three-line app-held memo of declared facts and rules recovers every one at 2% extra cost, and it carries qualitative goals at full parity with restating them, where merely showing the model the document node the goal lives in loses 117 of 120 judged comparisons. Views carry values; memos carry goals. And the agent itself writes that memo faithfully: delegated extraction tied our perfect-oracle baseline on all three models tested, retractions handled, zero noise, with no laziness even when a history window made the memo redundant.

**7. Never ask one prompt for N edits.** "Change every X inside Y" broke every strategy we had, including perfect retrieval: models deliver roughly half of N and stop, confident. Prompt-side fixes don't rescue it. The application enumerates the targets with a deterministic query and issues one small edit per node: 90 of 90 tasks, 674 of 674 subtasks, at a third of the cost. Give deterministic work to deterministic code.

Every clause above ships as code in [@kevinpeckham/barkup](https://www.npmjs.com/package/@kevinpeckham/barkup) or as a documented pattern with a reference implementation, each gated on its study before release.

## What we published against ourselves

The reason to trust the list above is the list below.

The original headline was wrong, and the correction became the most useful finding of the series. We first reported whole-document rewrite beating granular tools by wide margins. The real cause was a silent SDK default that hid the model's own tool calls from multi-turn history ([vercel/ai#16840](https://github.com/vercel/ai/issues/16840)). Under corrected history the interfaces tie, and the footgun itself, which quietly collapses small-model tool reliability to single digits while frontier models mask it, is worth more to a builder than the original claim was.

We refuted our own hypotheses on the record, repeatedly. Statelessness failed its first gate. Positional annotations rescued nothing. Embeddings added nothing over keyword overlap. Prompt interventions did not fix fan-out. A worked example did not teach exhaustiveness. The judge-graded study failed its headline gate in the most useful way possible, by splitting: the memo carries goals, the view does not.

And when a question could not be graded deterministically, we said so out loud instead of pretending. Qualitative rewrites run on a separately labeled track where the LLM judge had to pass its own pre-registered exam, fifty calibration pairs with planted answers, identity probes, and length traps, before grading a single real comparison. Both judges went fifty for fifty. Judge-graded numbers are never pooled with the deterministic claims.

The recurring villain, if the series has one, is silent failure. A model that cannot know something does not tell you. It invents a value that validates, polishes a paragraph it cannot aim, or would leave a safety net unfilled where nothing tests it. None of this appears in error logs. Nearly every component of the architecture exists to hand the model the context that makes silence impossible, and nearly every study worked by constructing the moment where the missing context would otherwise fail invisibly.

## What's still open

Honest boundaries, currently unmeasured and stated as such: follow-up requests that point at the previous edit ("make it shorter", "do the same to the footer") are the next study; whether production systems can shrink their history windows to the memo recipe's cost is a live question with real dollars attached; and everything above was measured on generated corpora, trees up to about 1,000 nodes, and two to five models per study.

Everything is reproducible from the [benchmark repo](https://github.com/kevinpeckham/barkup-bench): every brief committed before its first scored run, every corpus seeded, every grader unit-tested, every correction kept. The [research dashboard](/research/barkup-bench) has every chart. The [original capstone](/blog/stable-ids-are-all-you-need), written at seven studies, remains as the historical record, visible accretions and all. If you reproduce, extend, or refute any of this, we genuinely want the issue.
