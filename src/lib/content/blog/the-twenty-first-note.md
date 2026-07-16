---
title: "The Twenty-First Note"
metaTitle: "The Twenty-First Note | barkup-bench Study AH"
slug: the-twenty-first-note
description: "The session-notes memo is the most load-bearing mechanism our benchmark series ever shipped, and every study that validated it used three to six notes. The shipped implementation caps it at twenty, with a normalize step that silently drops the excess. Study AH filled it up. Below the cap, the memo is flawless at scale: perfect recall from a full memo at every position, standing rules applied with zero cross-contamination, lossless full-replace updates, sixty of sixty. Then a twenty-first declaration arrives, and a note dies every time. In thirty out of thirty cells, on all three models, the note that died was a goal, the one class of information only the memo carries. The block renders goals last, and everything that trims a list eats from the tail. Nobody designed that failure ordering. It fell out of a rendering order, a truncation clamp, and a cap nobody had ever filled."
date: 2026-07-16T18:00:00Z
draft: true
tags: [ai, agents, llm, open-source, barkup, benchmarks]
image: https://lj-01.nyc3.cdn.digitaloceanspaces.com/images/blog/jar-of-notes.webp
imageDescription: A watercolor painting of a glass jar stuffed full of folded paper notes, with one note falling beside it
author: Kevin Peckham
quote:
  text: Below the cap, flawless. At the cap, a note dies every time, and it is always a goal. Nobody designed that. It fell out of a rendering order and a truncation clamp.
  attribution: Kevin Peckham, Principal at Lightning Jar
glossary:
  - term: Session-notes memo
    definition: "An application-maintained list of facts, standing rules, and goals the user has declared, appended to every request. Validated across five earlier studies as the carrier for everything the conversation window forgets."
  - term: The cap
    definition: "The shipped memo holds at most twenty notes, enforced by a normalize step that silently drops anything past twenty. It never throws, and nothing in the prompt mentions it. Study AH is the first study to fill it."
  - term: Needle
    definition: "A unique registered token planted in each note so that its presence in a memo, a tool call, or an edited document is deterministically checkable. The whole study grades on needles, no judges involved."
  - term: Full-replace
    definition: "The shipped update protocol: the agent re-sends the complete notes list every time it records something. Lossless in our measurements wherever the update fits under the cap."
additionalReading:
  - title: "Who Writes the Memo?"
    url: "/blog/who-writes-the-memo"
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

[barkup-bench](/research/barkup-bench) is our open, pre-registered benchmark series on how LLM agents should edit structured documents. Its most load-bearing shipped mechanism, by some distance, is the session-notes memo: an application-maintained list of the facts, standing rules, and goals a user has declared, appended to every request. Five studies validated it. It carries facts the conversation window forgot, applies standing rules unprompted, holds qualitative goals at parity with restating them, survives casual human phrasing, and the agent can be trusted to write it itself.

Every one of those studies used a memo of three to six notes.

The shipped implementation holds twenty. Past twenty, a normalize step quietly drops the excess: no error, no warning, and nothing in the prompt tells the agent the cap exists beyond three words in a tool schema. That gap between validated-at-six and shipped-at-twenty had been sitting in the ledger since the memo shipped, and a long production session will absolutely accumulate twenty notes. Study AH filled the memo up on purpose.

## The experiment

Three constructions, all graded deterministically on planted needles, with three models. First, reading at scale: a full twenty-note memo, and an instruction that needs exactly one note ("set the content to the audit codename declared in the session notes"), with the needed note placed first, in the middle, or last, among nineteen same-shaped distractors. Second, rules at scale: a memo carrying twelve standing rules, exactly one of which covers the requested edit, which the model must apply unprompted without borrowing a neighboring rule's value. Third, writing at scale: a memo preloaded with ten, nineteen, or twenty notes, a new declaration in the user's message, and the shipped full-replace update tool, so we can grade exactly which notes survive the rewrite, both as the agent sent them and after the shipped clamp has its say.

## Below the cap: flawless

Everything the memo promised at six notes, it delivers at twenty. Recall from a full memo: fifteen of fifteen per model, at every position. There is no burial inside the memo; the first, middle, and last notes are all equally alive. Rule application from a twelve-rule memo: fifteen of fifteen per model, with zero contamination events; models applied exactly the one covering rule and never a neighbor's value. And the scary-sounding full-replace protocol, where the agent must faithfully re-send the entire list to record one new item? Lossless, sixty of sixty, at ten notes and at nineteen, every needle preserved, with the user's requested edit landing correctly alongside in all ninety integrity cells.

If the story ended there, this would be a tidy confirmation post: note-count is a safe budget, cap your monitoring at twenty, done.

## At the cap: the goals die first

Then the twenty-first declaration arrives at a full memo, and something has to give. Twenty-one notes cannot fit in twenty slots; a note will be lost, by arithmetic. What we measured is which note, and how, and whether anyone gets told.

A note died in thirty out of thirty cells, and it was silent in every one. The loss mode varied by model. Opus over-sent all ten times: twenty-one notes handed to a clamp that keeps the first twenty and says nothing. Gemini mostly pruned a note itself, eight of ten. Sonnet mixed, seven clamps and three prunes. But the victim never varied. In thirty of thirty cells, across three models and two entirely different loss mechanisms, the note that died was a goal.

The reason is almost embarrassingly mechanical. The memo block renders facts first, then rules, then goals. So the goals are always the tail of the list, and everything that shortens a list eats from the tail: the clamp keeps the first twenty, and models reconstructing a too-long list drop from the bottom. Nobody chose to deprioritize goals. The failure ordering fell out of a rendering order, a truncation function, and a cap nobody had ever filled.

What makes this sharp rather than merely tidy is what our own series says about goals. Study V measured that goals are the one class of information only the memo can carry: values can ride in views, but a goal read from a document loses to a goal told, and no restatement ceremony converts one into the other. The memo exists, more than for any other reason, to carry goals. At capacity, it sacrifices exactly that cargo first.

## What this changes for builders

If you maintain any capped, ordered list that an LLM or a truncation step can shorten, assume the tail dies first and ask what lives there. In our case the answer was the worst possible one. The fix is application-side and cheap: never let a silent clamp choose the victim. Evict deterministically in your update path, oldest fact first, never the goals; or bounce an over-cap update back to the agent with a memo-full message; or surface the cap in the UI so the user decides. What you should not do is add a prompt clause about it, at least not without measuring it first; that lesson is now written in this series twice.

And the general moral has teeth beyond memos. This is the series' quietest failure class yet: not a model failing a task, but two correct components (a rendering order and a bounds check) composing into a policy nobody wrote, that discards the most valuable class of data first, invisibly. The models were fine. The arithmetic was fine. The composition was the bug.

The usual caveats travel with the numbers: three models, one grammar, seeded corpora, needle-based deterministic grading throughout, and the cap edge measured at exactly twenty-plus-one. Everything is reproducible from the [benchmark repo](https://github.com/kevinpeckham/barkup-bench), pre-registration first, and the chart set lives on the [research dashboard](/research/barkup-bench#sec-saturation). Thirty-three studies in, the memo has earned its keep to the last slot, and the last slot has earned a guard.
