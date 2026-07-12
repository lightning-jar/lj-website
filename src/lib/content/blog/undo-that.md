---
title: "Undo That: The One-Line Echo That Replaces a Transcript"
metaTitle: "Undo That | barkup-bench Study X"
slug: undo-that
description: "Study X, the twenty-fourth in our pre-registered benchmark series, measured the most common request in any real editing chat and the last one our benchmark had never tested: follow-ups that point at the previous edit. \"Also make that same node bold.\" \"Apply the same change to the footer.\" \"Actually, undo that.\" Without something carrying the word that, the result was the strongest silent failure of the whole series: zero of 144 across three models, every miss a valid, applied, confidently wrong patch. Full history fixes it, but so does something far cheaper: a one-line note the application appends automatically, recording what it just applied, from and to. The echo ties the transcript on every model at half the cost, and on the production tier it beats the transcript outright. The measured stateless session stack is now complete: a fresh view, two worked examples, the memo, and the echo."
date: 2026-07-12T22:00:00Z
draft: false
tags: [ai, agents, llm, open-source, barkup, benchmarks]
image: https://lj-01.nyc3.cdn.digitaloceanspaces.com/images/blog/bunny-with-megaphone.webp
imageDescription: A watercolor painting of a rabbit in a plaid scarf and coat making an announcement through a red megaphone, on a cream background
author: Kevin Peckham
quote:
  text: The application always knows what it just did. Telling the model costs one line. Not telling it costs 144 silent wrong answers out of 144.
  attribution: Kevin Peckham, Principal at Lightning Jar
glossary:
  - term: Edit-anaphora
    definition: "A follow-up request that refers to the previous edit instead of naming anything: \"also set that same node's style\", \"apply the same change to the footer\", \"actually, undo that.\" The referent lives in the flow of conversation, not in the document."
  - term: Last-edit echo
    definition: "The winning carrier: one line the application appends automatically to each request, recording what it just applied with both values (set \"aspectRatio\" from \"4:3\" to \"16:9\" on the image named maple-ember). The from/to form is what makes undo carryable."
  - term: Skeleton view
    definition: The deliberately minimal view anaphora steps received. Showing the model a view focused on the right node would leak the answer the carrier is supposed to supply, so the study's views showed only the document's top structure.
  - term: Carrier
    definition: "Whatever transports the meaning of \"that\" across turns: the full conversation transcript, a two-exchange window, an app-written note, or nothing. Study X raced four of them."
additionalReading:
  - title: "Hand It Everything It Needs: 23 Pre-Registered Studies on LLM Document Editing"
    url: "/blog/hand-it-everything-it-needs"
  - title: "Who Writes the Memo? Auditing the Safety Net We Shipped"
    url: "/blog/who-writes-the-memo"
  - title: "The Two Things Your Agent Can't See: Memos and Mentioned Nodes"
    url: "/blog/the-two-things-your-agent-cant-see"
  - title: "barkup-bench research dashboard"
    url: "/research/barkup-bench"
  - title: "barkup-bench on GitHub: pre-registration, corpus, and raw analysis"
    url: "https://github.com/kevinpeckham/barkup-bench"
---

[barkup-bench](/research/barkup-bench) is our open, pre-registered benchmark series on how LLM agents should edit structured documents. Over twenty-three studies it assembled a session recipe that runs without conversation memory: a fresh view each turn, two worked examples, and an app-maintained memo of everything the user declares, which the agent itself writes faithfully. But every request in every one of those studies shared a property so ordinary we barely noticed it: each one made sense on its own.

Real editing chats don't work that way. The single most common thing a user types after an edit lands is a pointer at the edit itself. "Also make that same node bold." "Do the same to the footer." "Actually, undo that." The word that has no meaning in the document, no meaning in the memo, no meaning anywhere except the flow of the conversation, and our whole stateless recipe had never once been asked to resolve it. Study X asked, on purpose, in the way the series always does: build the failure structurally, then race the cheapest fixes.

## The setup: nothing to point at

The corpus plants predecessor and follow-up pairs: a normal, self-contained edit ("set the aspect ratio to 16:9 on the image named maple-ember"), immediately followed by one of three anaphora kinds. Amend targets the same node again without naming it. Repeat applies the same unnamed change to a different, named node. Undo reverses the previous change without restating anything, including the value to restore.

One design choice does all the work. On anaphora steps, the model receives only a skeleton view of the document, because a view focused on the right node would leak the answer. So the target, the attribute, and the value must arrive through whatever carries the conversation, and we raced four carriers: the full transcript, a window of just the last two exchanges, a single app-written line, and nothing at all.

## Nothing at all resolves nothing at all

The no-carrier arm went zero for 144, across all three models, including the strongest one. And in the pattern this series keeps finding, not one of the 144 was a refusal or a clarifying question. Every single miss was a valid, well-formed, applied patch aimed at a plausible guess. Asked to undo a change it had never seen, each model confidently changed something. This is the strongest silent-failure result in twenty-four studies, and it lands on the request class your users type most.

## The echo beats the transcript

Full history is the obvious fix and it works: essentially perfect everywhere. But the interesting arm is the cheapest one. The application always knows what it just applied, so it can append a single line to the next request with no model in the loop and no judgment required:

```
Previous edit (applied by the app): set "aspectRatio" from "4:3" to "16:9" on the image-atom with id "n42" (named "maple-ember").
```

That one line tied the full transcript on every model, statistically, at about half the transcript's cost. The from/to shape matters: because the note carries both values, "undo that" becomes fully answerable, and every undo cell under the echo passed on every model. And then the result we did not predict: on claude-opus-4.8, the tier our production system runs, the echo went a perfect 48 of 48 while the full transcript dropped two undo cells to 46. On the strongest model we tested, one honest line beat the entire conversation it summarizes.

The fine print, disclosed as always. "Apply the same change to X" is the strain point for compressed carriers: one model managed only 7 of 12 with the echo while the other two handled it, and the two-exchange window leaked on that same kind on every model. Carrier advice, like every serialization result in this series, is not model-independent; test on the tier you ship. And if a surface routinely sees "same change everywhere" requests, that's fan-out wearing a trench coat, and the measured answer remains app-side decomposition, not anaphora resolution.

## The recipe, complete

With Study X, the measured stateless session stack is finished, every clause with a number: a fresh view per turn, two worked examples in the system prompt, the session-notes memo for what the user declares, and the last-edit echo for what the app just did. Two of those four are lines the application writes mechanically. The model remembers nothing, and nothing measured is lost.

The usual caveats travel with the numbers: three models, one grammar, distance-one anaphora (the follow-up always immediately follows its referent), seeded corpora, and one mid-run gateway outage disclosed in the protocol notes (sessions error unrecorded and resume cleanly). Everything is reproducible from the [benchmark repo](https://github.com/kevinpeckham/barkup-bench), and the full chart set lives on the [research dashboard](/research/barkup-bench). If your users point at things in ways our corpus doesn't, that's the next study, and we want to hear about it.
