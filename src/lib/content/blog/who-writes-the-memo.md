---
title: "Who Writes the Memo? Auditing the Safety Net We Shipped"
metaTitle: "Who Writes the Memo? | barkup-bench Study W"
slug: who-writes-the-memo
description: "Study W, the twenty-third in our pre-registered benchmark series, closed the gap our own briefs had been disclosing for three days: Studies T and V validated the session-notes memo with perfect harness-written extraction, but what shipped to production delegates the writing to the agent itself, through a tool and a prompt rule, with a 32-message history window alongside. That window hides a nasty possibility: callbacks succeed via history whether or not the agent ever writes the memo, so an empty memo is invisible until the conversation scrolls, like a backup nobody has ever tried to restore. We tested the shipped mechanism verbatim on sessions long enough to cross the window, with a mid-session retraction, on three models including the production tier. Both gates passed: the agent records faithfully (recall 36 of 36 per model, retractions handled, zero noise), keeps recording even when history makes the memo redundant, and the post-truncation safety net holds."
date: 2026-07-12T16:00:00Z
draft: false
tags: [ai, agents, llm, open-source, barkup, benchmarks]
image: https://lj-01.nyc3.cdn.digitaloceanspaces.com/images/lazy-dog.webp
imageDescription: A watercolor painting of a cream French bulldog fast asleep on its side, on a pale background
author: Kevin Peckham
quote:
  text: A memo nobody has ever needed is exactly like a backup nobody has ever restored. We built sessions long enough to need it.
  attribution: Kevin Peckham, Principal at Lightning Jar
glossary:
  - term: Delegated extraction
    definition: "The production configuration: the agent itself decides what to record in the session-notes memo, via an update_session_notes tool with full-replace semantics and a prompt rule, instead of the application capturing declarations with code."
  - term: The laziness hypothesis
    definition: "The failure mode Study W was built to expose: while a declaration is still inside the history window, callbacks succeed whether or not the agent recorded it, so a never-filled memo looks fine until the conversation scrolls past the window, at which point the safety net silently is not there."
  - term: Post-truncation callback
    definition: A request depending on a fact declared so long ago that the declaring message has scrolled out of the history window, so only the memo can supply it. The study classifies these by the actually recorded window membership at request time.
  - term: Memo fidelity
    definition: "Deterministic bookkeeping made possible by planted declarables: recall (did each active fact land in the memo?), retraction handling (did the corrected value replace the old one?), noise (notes matching no declarable), and replace-integrity (did an update drop prior notes?)."
  - term: Verbatim artifact testing
    definition: The study tests the exact shipped tool description, schema, prompt rule, memo rendering, and window rule, ported character-for-character and guarded by identity tests, so the result is about the thing running in production, not a paraphrase of it.
additionalReading:
  - title: "The Two Things Your Agent Can't See: Memos and Mentioned Nodes"
    url: "/blog/the-two-things-your-agent-cant-see"
  - title: "Views Carry Values, Memos Carry Goals: Our First Judge-Graded Study"
    url: "/blog/views-carry-values-memos-carry-goals"
  - title: "Stable IDs Are All You Need: Seven Studies on Letting LLMs Edit Trees"
    url: "/blog/stable-ids-are-all-you-need"
  - title: "barkup-bench research dashboard"
    url: "/research/barkup-bench"
  - title: "barkup-bench on GitHub: pre-registration, corpus, and raw analysis"
    url: "https://github.com/kevinpeckham/barkup-bench"
---

[barkup-bench](/research/barkup-bench) is our open, pre-registered benchmark series on how LLM agents should edit structured documents: page layouts, templates, CMS content. Twenty-two studies in, the working recipe is remarkably light: give every node a stable id, edit by small anchored patches, show the model a focused view instead of the whole document, and run sessions with no conversation memory at all, just two worked examples in the system prompt and a short session-notes memo recording the facts, rules, and goals a user declares. [Study T proved the memo carries facts](/blog/the-two-things-your-agent-cant-see). [Study V proved it carries goals](/blog/views-carry-values-memos-carry-goals). And both studies carried the same disclosed asterisk: the memo in those experiments was written by the test harness, perfectly, every time. An oracle.

What actually shipped delegates the writing to the agent. There is a tool called update_session_notes, a rule in the system prompt telling the agent when to use it, and a 32-message history window running alongside. Nobody had measured whether the agent actually writes the memo, writes it correctly, or keeps writing it when nothing seems to depend on it. Study W is that audit, and the audit had a specific fear.

## The backup nobody has restored

Here is the nasty shape of the problem. While a declaration is still inside the history window, the agent can answer every callback from history alone. The memo is redundant. Which means a lazy agent, one that never calls the tool at all, looks exactly like a diligent one, for the entire stretch of session where anyone is watching. The memo only becomes load-bearing when the conversation scrolls past the window, and if nothing was ever recorded, the failure arrives silently at precisely the moment the safety net was supposed to engage.

Every sysadmin knows this shape: a backup nobody has ever restored is not a backup, it is a hope. Our last three studies each found a version of silent failure, [invented values](/blog/the-two-things-your-agent-cant-see), [oblivious polishing](/blog/views-carry-values-memos-carry-goals), and we had just shipped a mechanism whose failure mode would be invisible by construction. So the study was designed to force the moment of truth: [sessions of 36 edits](/blog/the-thirty-sixth-edit), long enough that early declarations scroll out of the window, with callbacks placed on both sides of the truncation line, and, because real users change their minds, a mid-session retraction ("correction: the codename is now X2, not X1") whose old value had better not resurface.

One methodological note we consider non-negotiable: the study tests the shipped artifacts verbatim. The tool description, its schema, the prompt rule, the memo rendering, the window rule, all ported character-for-character with identity tests guarding the port. Anything less and we would be de-risking a paraphrase.

## What the audit found

The agent writes the memo, and writes it well. In the pure test, no history at all, so the memo is the only carrier, agent-written memos tied the harness-written oracle on all three models tested. The bookkeeping, which is fully deterministic because every declarable was planted, is almost boring: end-of-session recall 36 of 36 per model, retraction handling 12 of 12 everywhere (the corrected codename in, the retracted one gone), zero junk notes across all 72 agent sessions, and a single dropped note in one session as the only blemish. The tool got called about four times per session, which is exactly how many declarative moments the sessions contain. The models call it when the user declares something, and essentially never otherwise.

The laziness hypothesis is refuted. In the shipped configuration, history window plus memo, the recording cadence did not change: four calls per session, same as when the memo was the only lifeline. The agents keep taking notes even when nothing visibly depends on it. And at the moment of truth, callbacks landing after the declaring message had scrolled out of the window, the memo was there: a perfect 36 of 36 on the production-tier model, 35 of 36 on the cheap one. The over-32-message protection is real protection.

Two honest footnotes. One model (claude-sonnet-4.5, not the tier this mechanism ships on) dipped to 31 of 36 on post-truncation callbacks; the dip is not statistically significant at this sample size, and, tellingly, its memo was complete in every failing cell, so whatever stumbled there, it was not extraction. And this study contributed the series' first data on claude-opus-4.8, the tier the production system actually runs, after [an earlier study proved recipe advice is not model-independent](/blog/two-examples-replace-a-memory). Opus was the cleanest of the three models: perfect callbacks in the shipped configuration, including every post-truncation cell.

## What this means for builders

If you ship an agent memo, three transferable lessons. First, delegation works: a full-replace tool with a clear description plus one prompt rule produced faithful, noise-free extraction on every model we tested, no app-side capture code required. Second, test past your window: any safety mechanism that only matters after truncation must be measured after truncation, on sessions long enough to get there, or you are shipping the untested backup. Third, measure fidelity, not just task success: recall, retraction handling, and noise are all deterministic if you know what was declared, and they are the difference between "the tasks passed" and "the mechanism works."

The usual caveats travel with the numbers: three models, one grammar, planted declarables, twelve sessions per arm, and bench editing prompts rather than the production system's full prompt stack (the memo machinery is verbatim; the surrounding prompts are the benchmark's measured protocol). Everything is reproducible from the [benchmark repo](https://github.com/kevinpeckham/barkup-bench), including the character-identity tests on the ports and the per-step memo snapshots that make every fidelity number re-computable offline. The oracle asterisk that Studies T and V carried is now closed with measurement: the memo works, the agent writes it, and the safety net holds exactly where it was needed.

Update, later that day: the memo got a sibling. Study X measured the request class the whole series had skipped, follow-ups that point at the previous edit ("also make that same node bold", "undo that"), and without a carrier they failed 0 for 144 across three models, every miss a valid silent guess. The fix is even cheaper than the memo because it requires no agent judgment at all: a one-line last-edit echo the application appends automatically, with both the old and new values so undo is answerable. It tied full history on every model at half the cost and beat history outright on the production tier. The stateless stack is complete: view, examples, memo, echo. Details in [Undo That](/blog/undo-that).
## Part two of the audit: does the memo survive how people actually talk?

Update, the same weekend: Study W left one soft spot we could see but had not yet measured. Every declaration in it, and in the studies before it, was announced like a form field: "For later reference: the campaign codename is vesper-7." Real users do not talk like that. They declare mid-sentence, bury standing rules inside other requests, retract with "scratch that," and produce plenty of talk that sounds declarative while declaring nothing at all.

Study Y isolated phrasing as the only variable, with twin sessions: identical trees, identical edits, identical schedules, identical chatter, identical session ids. The single difference was the wording of the declarations. One twin announced them formulaically; the other declared them the way people do ("by the way, let's call the campaign quasar-4 going forward", "small correction, we renamed the campaign to X2, forget X1"). And for the first time the noise metric got real bait: four chatter lines per session that gesture at meaning and commit to none ("the client saw a screenshot and seemed happy").

Perfect score, all three models. There was not one callback cell anywhere in the study where the formulaic twin succeeded and the casual twin failed, or the reverse. Recall 36 of 36. Casual retractions handled 12 of 12. And the number we were most nervous about: 432 chatter baits produced zero false memo notes. The agents record declarations and only declarations, regardless of how the declarations are dressed. So two practical conclusions, both negative in the best way: your users need no announcement syntax, and the extraction prompt rule needs no softening, because its record-only-declarations wording is doing real discrimination work at zero false-positive cost. One whisper, consistent with the redundancy finding above: under the history window the recording cadence eases from a flat 4.0 to about 3.9 calls per session and recall dipped a note or two, always covered by the still-visible history. The full tables are in the [REPORT](https://github.com/kevinpeckham/barkup-bench), where the formulaic twin also serves as a clean replication of this post's main result, now under chatter pressure.

Update, July 2026: the memo got its stress test (Study AH). Filled to its shipped twenty-note cap, everything this post measured held at ceiling: recall of any note perfect at every position, standing rules applied with zero cross-note contamination, and the agent's full-replace updates lossless wherever the update fit, sixty of sixty. The one crack is the cap edge itself: a twenty-first declaration always costs a note, silently, and every one of the thirty lost notes was a goal, because the block renders goals last and both the truncation clamp and the models' own pruning eat from the tail. The fix is in the application's update path (deterministic eviction, oldest fact first), not in the prompt. Details on the [dashboard](/research/barkup-bench#sec-saturation). Second update: that fix has now been measured at the injury site (Study AK), and it closes the wound where the app can reach it. Every over-cap update became a designed eviction, nineteen of nineteen with zero goals evicted, and goal survival at the cap edge went from zero of ten to ten of ten on the frontier tier. The residue is the other pathway: a model that prunes a note before sending the list has already made the choice, and no update-path code can unmake it. One model earned a footnote in the series doing better than the fix itself: told by the eviction notice that its update had cost a note, it re-sent the memo consolidated into fewer sentences, all twenty-one pieces of content intact. [Details](/research/barkup-bench#sec-eviction).
