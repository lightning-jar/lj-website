---
title: "Views Carry Values, Memos Carry Goals: Our First Judge-Graded Study"
metaTitle: "Views Carry Values, Memos Carry Goals | barkup-bench Study V"
slug: views-carry-values-memos-carry-goals
description: "Study V, the twenty-second in our pre-registered benchmark series and the first that could not be graded deterministically, asked whether the context fixes from Studies T and U survive qualitative goals like \"rewrite this paragraph to focus on our central thesis.\" To keep our integrity rules intact, the LLM judge had to pass its own pre-registered exam before grading anything, and both judges aced it 50 for 50. The results split cleanly: models that could not know the goal polished the wrong paragraph without complaint, the application memo carried the goal at full parity with an explicit instruction, and the surprise, models shown the document node where the goal lived read it but wrote measurably less focused prose, losing 117 of 120 judged comparisons. Views carry values; memos carry goals."
date: 2026-07-11T16:00:00Z
draft: false
tags: [ai, agents, llm, open-source, barkup, benchmarks]
image: https://lj-01.nyc3.cdn.digitaloceanspaces.com/images/blog/rabbit-judge-02.webp
imageDescription: A watercolor illustration of a stern rabbit judge in a Victorian suit and cravat, one finger raised, presiding over a handwritten document
author: Kevin Peckham
quote:
  text: The model that read the thesis wrote about the topic. The model that was told the thesis wrote about the thesis. A judge can see that difference 117 times out of 120; a validator never will.
  attribution: Kevin Peckham, Principal at Lightning Jar
glossary:
  - term: Judge-graded (Track 2)
    definition: "A separate grading track for qualitative questions: a pinned LLM judge compares two rewrites pairwise under a pre-registered protocol. Track 2 results are labeled and never mixed with the series' deterministic claims."
  - term: Judge calibration gate
    definition: "The judge's own unit test: fifty committed pairs with known correct answers, identity probes that must tie, and length probes where the longer rewrite is worse. If the judge fails its gate, the study halts before any scored run."
  - term: Planted defect
    definition: A paragraph deliberately assembled from a different fictional company domain's sentences, so the direction of improvement, toward the page's stated thesis, is known by construction while the prose stays meaningful.
  - term: Oblivious polishing
    definition: "The blind arms' failure mode: asked to focus a paragraph on a goal they could not know, models tidied the off-topic paragraph fluently and validly, without ever flagging the missing goal."
  - term: Session-notes memo
    definition: The short application-maintained block from Study T, recording facts and standing rules the user has declared, appended to each editing request. Study V shows it carries qualitative goals as well as it carries codenames.
additionalReading:
  - title: "The Two Things Your Agent Can't See: Memos and Mentioned Nodes"
    url: "/blog/the-two-things-your-agent-cant-see"
  - title: "The Thirty-Sixth Edit: Long LLM Sessions Don't Need Memory Either"
    url: "/blog/the-thirty-sixth-edit"
  - title: "Stable IDs Are All You Need: Seven Studies on Letting LLMs Edit Trees"
    url: "/blog/stable-ids-are-all-you-need"
  - title: "barkup-bench research dashboard"
    url: "/research/barkup-bench"
  - title: "barkup-bench on GitHub: pre-registration, corpus, and raw analysis"
    url: "https://github.com/kevinpeckham/barkup-bench"
---

For a month, [barkup-bench](/research/barkup-bench) has graded every claim the same way: compute the expected document, compare byte for byte, and let unit-tested code decide. Twenty-one studies of exact edits. But the question that started our last two studies, whether an editing agent without memory can still do strategic work, has a half we had been avoiding because our graders could not reach it: requests like "rewrite the third paragraph so it focuses on our central thesis." There is no byte-for-byte answer to *more focused*. Somebody has to judge.

Study V is our first judge-graded study, and we spent most of its design budget making sure the judge could not quietly become the weakest link in a series that pre-registers everything. Here is how we kept our own rules, and what the judge saw when the grading finally started.

## The judge takes the exam first

Our hard rule has always been that graders get unit tests, because a benchmark with an unvalidated grader measures nothing. An LLM judge gets the same treatment. Before it graded a single real rewrite, each judge faced a committed, seeded exam: thirty pairs where one rewrite is on-thesis and the other provably is not, ten pairs where both sides are literally identical (a fair judge must tie), and ten pairs where the longer rewrite is the worse one (a length-biased judge fails). Every comparison runs twice, in both presentation orders, and only order-consistent answers count. The pass bar was pre-registered, and failure meant the study halts before spending.

Both judges, a frontier model and a small one, neither of which wrote any rewrite being judged, went fifty for fifty. Clean sweep, position bias zero out of ten, length bias zero out of ten. Only then did the scored runs begin.

## The setup: a page with a planted problem

The corpus is thirty fictional company About pages, assembled by a seeded generator from committed sentence pools: a mission statement carrying the company's thesis, two on-thesis paragraphs, and one paragraph deliberately built from a different company domain's sentences. An alpine safety company whose third paragraph is inexplicably about port logistics. The instruction is always the same: rewrite that paragraph to focus on the central thesis. What varies, in five arms, is where the thesis lives: stated in the instruction (the control), sitting in the mission node with a view that shows only the target, sitting in the mission node with a view that shows both nodes, declared in earlier conversation with the Study T memo, or declared in earlier conversation with nothing.

Every arm's rewrite then went head to head against the control's rewrite from the same model on the same page, judged pairwise.

## What the judge saw

The blind arms lost every single comparison, 120 out of 120, and the way they lost matters. They did not invent a thesis. They polished the port logistics paragraph: tightened it, reorganized it, kept it entirely about freight, and never said a word about being unable to know the goal. Fluent, mechanically valid, useless. Our earlier study found silent invention when a model cannot see a value; this is its qualitative sibling, oblivious polishing, and it is just as invisible in an error log.

The memo carried the goal at full strength. With one note line in the application memo, the central thesis is such and such, rewrites tied the explicit-instruction control statistically, and on one model the memo arm actually won the head-to-head, ten wins to two. Study T's finding generalizes completely: the memo carries intent as reliably as it carries codenames.

The surprise failed our gate. In the arm where the mission node sat right in the view, the models clearly read it. Their keyword coverage of the thesis jumped from zero to three quarters, and every rewrite was about the right subject. And they still lost 117 of 120 comparisons. Put the winning and losing rewrites side by side and the difference is visible to the naked eye: the control opens with the thesis, nearly verbatim, and builds from it; the view arm writes competent prose that orbits the topic without ever anchoring it. Reading a goal is not the same as being told one.

## What this means for builders

The last study's rule was that focus ids must include every node the request mentions, because views that hide a needed value produce silent fiction. That rule stands, and Study V draws its boundary: it is a rule about *values*, the data an edit must read. For *goals*, the intent a rewrite must satisfy, showing the model where the goal lives is measurably second-best. The recipe:

- **Views carry values.** Put every node the request mentions in the focus ids, so the model can read what it must copy, match, or preserve.
- **Memos carry goals.** When the user declares an objective, a thesis, a tone, a standing rule about how things should read, record it and restate it outright in the memo or the instruction. One note line buys full parity with the best case.
- **Do not make the model infer intent from the document.** It will read the goal and still under-deliver on it, and nothing in your logs will look wrong.

The honest caveats are bigger here than usual, and we state them loudly: this is judge-graded, not deterministic. The verdicts come from a pinned judge under a registered protocol, replicated by a second judge (83% agreement, no conclusion flips), triangulated by a keyword proxy that ranks the arms identically, and the whole track is labeled separately in the [REPORT](https://github.com/kevinpeckham/barkup-bench) so it can never blend into the exact-edit claims. Two models, one task family, thirty pages, and one voided first run disclosed in the protocol notes (a grader bug we caught before a single verdict was scored). If you believe the judge is wrong, every pair it saw is committed in the repo, and re-judging them is one script.

Update, the next day: one asterisk remained on the memo across all of this. The harness wrote it, perfectly. Production delegates the writing to the agent itself. Study W audited that delegation verbatim, on sessions long enough that the history window truncates, and the agent passed: faithful recall, retractions handled, zero noise notes, no laziness when history made the memo redundant, and a perfect post-truncation score on the production tier. Details in [Who Writes the Memo?](/blog/who-writes-the-memo).

Update, two days later: the memo turned out to carry a third thing. Study Z planted a conflict between a standing styleguide rule and a user instruction, and every model resolved it by picking a reading, never by violating either side. Distilling the applicable rules into the memo measurably changed which reading won: one model went from satisfying both obligations 2 times in 12 to 11 in 12 with the rules restated near the request. Views carry values, memos carry goals, and now, when two rules could both apply, memos carry interpretations. Details in [Stronger LLMs Follow Conflicting Instructions More Literally, Not Less](/blog/stronger-llms-follow-conflicting-instructions-more-literally).
