---
title: "The Thirty-Sixth Edit: Long LLM Sessions Don't Need Memory Either"
metaTitle: "The Thirty-Sixth Edit | barkup-bench Study S"
slug: the-thirty-sixth-edit
description: "Study S, the nineteenth in our pre-registered benchmark series, ran the two surviving session recipes through 36-edit sessions, three times the horizon everything else was measured at. Both held. The stateless recipe (no conversation history, just two worked examples in the system prompt) showed no late-session decay: edit 36 lands as reliably as edit 1. What diverges is cost. Keeping history means the meter runs, growing to about 24k input tokens per edit by the end; the stateless recipe stays flat at about 2.1k, five to six times cheaper per session. The post closes with the series' complete practical advice for builders of LLM document-editing apps."
date: 2026-07-10T20:00:00Z
draft: false
tags: [ai, agents, llm, open-source, barkup, benchmarks]
image: https://lj-01.nyc3.cdn.digitaloceanspaces.com/images/blog/pocket-watch.webp
imageDescription: A watercolor painting of an antique brass pocket watch with Roman numerals and a small seconds dial, on a cream background
author: Kevin Peckham
quote:
  text: Keeping history is a taxi with the meter running. The stateless recipe is a flat fare, and the ride is just as safe.
  attribution: Kevin Peckham, Principal at Lightning Jar
glossary:
  - term: Editing session
    definition: A sequence of edit requests against the same document, one at a time, where each edit applies to the document as the previous edits left it. Study S measures sessions of 36 sequential edits.
  - term: Keep-history recipe
    definition: "One long conversation for the whole session: every earlier request and every earlier patch stays in the model's context, plus a fresh view of the current document each turn. Accurate, but the context grows with every edit."
  - term: Stateless recipe
    definition: "Every edit is a brand-new conversation: a fresh view of the current document, the one edit request, and two fixed worked examples in the system prompt. Nothing else. Flat cost per edit, forever."
  - term: Worked examples
    definition: Two short demonstrations pasted into the system prompt, each showing a small document view, an edit request, and the correct patch, drawn from a tiny fixed tree unrelated to any real document. About 900 tokens total, verified by unit test.
  - term: Focused view
    definition: A rendering of the document that shows only the region an edit concerns, with everything else collapsed to id-bearing placeholders, so the model can patch accurately without reading the whole tree.
additionalReading:
  - title: "Your Agent Doesn't Need a Memory: Two Worked Examples Replace Session History"
    url: "/blog/two-examples-replace-a-memory"
  - title: "barkup 0.5: Your Code Finds the Targets Now"
    url: "/blog/barkup-0-5-deterministic-selection"
  - title: "Then We Found the Cheap Part: One Search Call Grounds LLM Tree Edits"
    url: "/blog/then-we-found-the-cheap-part"
  - title: "Stable IDs Are All You Need: Seven Studies on Letting LLMs Edit Trees"
    url: "/blog/stable-ids-are-all-you-need"
  - title: "barkup-bench on GitHub: pre-registration, corpus, and raw analysis"
    url: "https://github.com/kevinpeckham/barkup-bench"
  - title: "@kevinpeckham/barkup on npm"
    url: "https://www.npmjs.com/package/@kevinpeckham/barkup"
---

For the past month we have been running
[barkup-bench](https://github.com/kevinpeckham/barkup-bench), a
pre-registered benchmark series on one narrow question with broad
consequences: what is the most reliable way to let an LLM edit a
structured document? Not prose, but the typed trees behind real
products: page layouts, document templates, CMS content. Every study
is registered by commit before its first scored run, every gate is
stated in advance, and we publish whatever the data shows, which so
far has included one major correction and three refutations of our
own ideas. Study S is the nineteenth in the series, and it exists
because our own advice had a horizon problem.

## The setup: an afternoon of edits

Picture a user working on a landing page in an editor where the LLM
does the editing. Rename the headline. Move the testimonial above
the pricing table. Delete the old banner. Add a fourth feature card.
Each request is small, each applies to the page as the previous
edits left it, and by the end of the afternoon there have been three
dozen of them. That is an editing session, and sessions are where
agent systems quietly rot: an edit that works fine as request number
three can fail as request number thirty, after the context has
filled with stale views of a page that no longer looks like that.

Earlier studies in the series left us with exactly two session
recipes that survived their gates, and they are philosophical
opposites.

The first is **keep-history**: one long conversation, everything
retained. Think of a courier who carries every letter the two of you
have ever exchanged to every new meeting, plus one current
photograph of the page. It works. The photograph keeps the facts
straight and the old letters carry precedent for how requests get
turned into patches.

The second is **stateless plus worked examples**: every edit is a
brand-new conversation. The model gets a fresh photograph of the
current page, the one request, and a laminated cheat sheet in the
system prompt showing two solved examples (an insert and a move, on
a toy document it will never actually edit). No letters, no history,
no memory of the session at all. Study P's surprise was that this
matches keep-history exactly, because what history was contributing
turned out to be teaching, not memory. The cheat sheet teaches the
same lesson at a fraction of the weight.

## The worry: does the cheat sheet wear out?

Both recipes had only ever been measured at 12-edit sessions. Three
worries pointed at longer horizons. Maybe the stateless recipe
decays: with dozens of edits accumulating and interacting, perhaps
examples taught at step 1 fade by step 30, the way a lesson fades
when the exam is far from the textbook. Maybe keep-history decays
instead, or hits a hard ceiling: its conversation grows every turn,
and one earlier study arm ran out of context entirely at step 11.
Or maybe both hold, and the only thing that diverges is the bill.

Study S ran both recipes through 36-edit sessions, three times the
measured horizon, on ten fresh documents and the same two models the
series always tests (claude-sonnet-4.5 and gemini-3.5-flash). That
is 1,440 scored edits. The pass gate was registered in advance: the
stateless recipe had to show no late-session decay, stay
statistically tied with keep-history, and land equivalent final
documents.

## The result: nothing broke except the cost curve

The gate passed on both models, and the answer to the horizon worry
is the third one. Both recipes held. Keep-history went 719 of 720
steps across the two models. The stateless recipe went 713 of 720,
with its final dozen edits (steps 25 to 36) landing at 98 to 99%,
statistically indistinguishable from its first dozen. Edit 36 is
taught by the same two examples as edit 1, and taught just as well.
The cheat sheet does not wear out.

The bill is another story, and the pocket watch is the right
picture. Keeping history is a taxi with the meter running: every
turn adds the new view and the new patch to everything that came
before, so the per-edit cost ticks upward the whole session, from
about 1,200 tokens at the first edit to about 24,000 by the
thirty-sixth. The stateless recipe is a flat fare: roughly 2,100
input tokens per edit, at step 1 and at step 36 and at any step
after that, because nothing accumulates. Over a full session that is
449,000 input tokens against 81,000, a factor of five to six, and
the factor keeps growing with session length because one line is
linear and the other is flat.

Two honest footnotes. Keep-history never came close to a context
ceiling here (24k per step is nowhere near model limits), so it
remains a perfectly valid recipe if you prefer it, and on one model
it edged the stateless recipe on perfect end-to-end documents (10 of
10 versus 8 of 10, within the pre-registered margin). And all seven
stateless misses across 1,440 edits were placement edits (inserts
and moves), the same class every session study has flagged, so if
you extend the cheat sheet for your own grammar, that is the
operation class to teach.

## What this means if you are building one of these

If your app lets an LLM edit documents in sessions, you no longer
need to choose between cost and safety. The stateless recipe is now
the measured default for long sessions: persist the document in your
application, render a fresh focused view each turn, and put two
worked examples of your patch dialect's tricky operations in the
system prompt. You get flat per-edit cost, no context ceiling ever,
and immunity to the whole class of history-construction bugs (the
worst defect this series ever found was an SDK silently dropping
tool calls from history). The examples must speak your grammar, so
write them once, unit-test that their patches apply, and laminate
them.

One scope note, in the spirit of the series. Every session we have
measured issues self-contained requests: the instruction plus the
current document carry everything needed to execute the edit. Real
users also say things like "use the campaign codename we settled
on", where the needed fact lives only in the earlier conversation.
A stateless editor cannot resolve those by construction, and none
of our studies has measured that class yet. Study T is now
registered to close exactly that gap, including the obvious cheap
fix: a small app-maintained note block, a memo instead of a
transcript. Until it reports, read every claim in this post as
applying to self-contained requests.

## The whole series' practical advice, in one place

Nineteen studies in, here is everything we would tell a builder,
each line backed by a pre-registered study:

- **Give every node a permanent id.** Everything else depends on
  this. Across the entire series, zero failures were caused by a
  model mangling a stable id (main matrix onward).
- **Edit by id-anchored patches, not whole-document rewrites.**
  At small sizes everything ties; above roughly 300 nodes, anchored
  patches are the only interface that holds for both frontier and
  cheap models, and they are the cheapest and fastest everywhere
  (Studies F and H).
- **Show the model a focused view, not the whole document.** A
  view of the target region at 1 to 2% of the tokens loses nothing
  in accuracy at any size tested (Studies I and J).
- **Regenerate the view every turn.** Views from earlier turns go
  stale as edits land, and stale views are how sessions drift
  (Study K).
- **Skip session memory entirely: two worked examples in the
  system prompt.** History's contribution is teaching, and a ~900
  token cheat sheet teaches it. Measured to 36 edits at flat cost
  with no decay (Studies M, O, P, and S).
- **When the user's request doesn't name a node, give the model
  one search tool.** A skeleton view plus a deterministic keyword
  search call grounds plain-language requests at oracle-level
  accuracy, median one call. Embeddings measured no better than
  keyword overlap for this, so we shipped the thirty lines instead
  of the vector store (Studies L and N).
- **Big trees plus an expensive model: split the roles.** Let a
  cheap model read the full tree and name the target ids, then let
  the expensive model patch against the focused view. Accuracy
  held while the expensive model's input dropped 97% (Study N).
- **Never ask one prompt for N edits.** "Change every X inside Y"
  breaks every strategy: models deliver roughly half of N and stop,
  confident. Enumerate the targets in your own code and loop
  single-target edits: 90 of 90 tasks, 674 of 674 subtasks, at a
  third of the cost (Studies Q and R).
- **Audit what your SDK puts in the conversation history.** The
  dramatic interface gaps we first published were an artifact of a
  history that silently hid the model's own tool calls. Fixing that
  erased the gaps, and we corrected the record (Study G). The
  stateless recipe sidesteps this class of bug entirely.

Everything above ships as code in
[@kevinpeckham/barkup](https://www.npmjs.com/package/@kevinpeckham/barkup)
(anchored patches, focused views, `findNodes` search, `selectNodes`
enumeration) or as documented patterns with reference
implementations in the
[benchmark repo](https://github.com/kevinpeckham/barkup-bench). The
usual caveats travel along: two to four models per study, generated
corpora, trees up to about 1,000 nodes, and pre-registered gates
behind every claim. If you find the task shape that breaks any of
this, we genuinely want the issue.
