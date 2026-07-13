---
title: "Stronger LLMs Follow Conflicting Instructions More Literally, Not Less"
metaTitle: "Stronger LLMs Follow Conflicting Instructions More Literally | barkup-bench Study Z"
slug: stronger-llms-follow-conflicting-instructions-more-literally
description: "Study Z, the twenty-sixth in our pre-registered benchmark series, finally measured the thing almost every AI document editor does without evidence: shipping a standing context block with every request. Company background, client records, a twelve-rule styleguide. Does the model actually use it? The answer is a clean yes: 216 of 216 on facts and rules across three models, zero cross-client contamination in 324 cells, and no burial effect anywhere in the styleguide. The hazard we found instead lives in the styleguide itself. When a standing rule collides with what the user asked for, models don't break either one. They pick a reading. And the strongest model picks the most literal reading most often."
date: 2026-07-13T16:00:00Z
draft: false
tags: [ai, agents, llm, open-source, barkup, benchmarks]
image: https://lj-01.nyc3.cdn.digitaloceanspaces.com/images/blog/elephant-referee.webp
imageDescription: A watercolor painting of an elephant in a green-and-white striped referee's jersey holding a soccer ball, on a cream background
author: Kevin Peckham
quote:
  text: The failure mode of a conflicted spec is not chaos. It is disciplined obedience to the rule you forgot you wrote.
  attribution: Kevin Peckham, Principal at Lightning Jar
glossary:
  - term: Standing context
    definition: "The block an application ships with every model request regardless of what the user asked: company background, solution descriptions, client records, a styleguide. Also called a brand pack. It rides in the system prompt and the user never sees it."
  - term: Near-miss distractor
    definition: "A wrong answer that looks right. Each test pack held one target client and three others with the same record shape, so a model reaching for an email or product name had three plausible wrong values sitting next to the correct one."
  - term: Spec conflict
    definition: "A standing rule and a user instruction that cannot both be satisfied under the rule's strictest reading. Study Z planted one on purpose: a contact-line format rule written with the word 'always', against an instruction asking for one thing more than the format allows."
  - term: Prompt caching
    definition: "Provider-side reuse of an unchanged prompt prefix. Reads cost about a tenth of normal input tokens, but only if the prefix is byte-identical across requests. A block that changes per request never reads and always pays the write surcharge."
additionalReading:
  - title: "Hand It Everything It Needs: 23 Pre-Registered Studies on LLM Document Editing"
    url: "/blog/hand-it-everything-it-needs"
  - title: "Views Carry Values, Memos Carry Goals"
    url: "/blog/views-carry-values-memos-carry-goals"
  - title: "The Two Things Your Agent Can't See: Memos and Mentioned Nodes"
    url: "/blog/the-two-things-your-agent-cant-see"
  - title: "barkup-bench research dashboard"
    url: "/research/barkup-bench"
  - title: "barkup-bench on GitHub: pre-registration, corpus, and raw analysis"
    url: "https://github.com/kevinpeckham/barkup-bench"
---

[barkup-bench](/research/barkup-bench) is our open, pre-registered benchmark series on how LLM agents should edit structured documents. Twenty-five studies in, it has measured views, memos, echoes, worked examples, and the failure modes of each. Study Z turns to something so common it hides in plain sight: the standing context block. If you have built an AI document editor, you probably ship one. Company background, what the business sells, client records, a styleguide. It goes out with every single request, whether the request needs it or not, on the theory that the model will reach into it when a task calls for a fact or a rule.

That theory is load-bearing in production systems, including ours, and nobody we know of had measured it. Three questions, then. Does the model actually pull the right fact out of a few thousand tokens of context it was never told to read? Does it apply a styleguide rule nobody restated? And is shipping everything actually better than shipping just the relevant slice?

## The setup: planted facts, planted rules, planted traps

We generated twelve organization packs, about 3,300 tokens each, shaped like the real thing: an about section, a solutions list, four client records, and a twelve-rule styleguide. Then we planted obligations a grader can check mechanically.

Every pack holds one target client and three distractors with identical record shapes. If the task says "set the contact slot to Horizon Oak's email, exactly as our records have it," there are three other perfectly plausible emails within arm's reach. That is the trap the series has learned to respect: since Study U we have known that a model missing information does not ask for it, it invents something plausible. Here the plausible inventions are pre-planted, so we can catch every one.

The styleguide rules work the same way. Most of the twelve are filler ("prefer active voice"). Two or three are governing rules with machine-checkable teeth: product names always carry the ™ mark, headlines always use a specific text style, taglines always end with a fixed phrase. And we rotated where the governing rules sit, at the head of the styleguide, buried in the middle, or at the tail, because everyone assumes buried rules get lost.

Three arms, then. Ship the whole pack. Ship an oracle-picked slice of just the target client and the applicable rules. Or ship the whole pack plus the applicable rules distilled into the session-notes memo this series measured in earlier studies. Three models: claude-sonnet-4.5, gemini-3.5-flash, and claude-opus-4.8, the tier our production system runs.

## Result one: it just works

Facts and rules, all models, all arms: 216 of 216, every time. The exact email copied past three near-misses. The phone number, character for character. The ™ mark applied to a product name the instruction never flagged, because rule six of a styleguide nobody restated said so.

Zero contamination in 324 cells. Not one distractor email, phone number, product, or city ever leaked into an output. And position did not matter at all: head, middle, and tail rules each went 12 for 12 on every model. At this pack size there is no burial effect, full stop.

We also measured what the slice arm was supposed to win, and it lost twice. Accuracy: identical, 100 percent both ways. Cost: the slice arm was the only configuration that ever paid a caching penalty. A cached prompt prefix only pays off if it is byte-identical across requests, and a per-request slice never is. The full pack, cached under the layout our production system ships, read 64 to 68 percent of its input from cache and cut effective input cost by 25 to 43 percent. The slice never got a single cache read, and on opus it paid a 10.8 percent surcharge in pure cache writes. Ship the whole pack. Keep it static. Let the cache do the work.

## Result two: the conflict we accidentally registered

The third task type asked for a footer contact line "using our standard contact format and mentioning their product." The styleguide's format rule reads: contact lines always follow the form email, pipe, city. Read that rule strictly and there is no room for a product mention. We registered a collision without noticing, which turned out to be the most instructive accident of the series.

Because here is what 108 conflicted cells per model did not contain: a single true violation. No wrong emails. No missing pipes. No product mentioned without its ™ mark. No contamination. Every model resolved the conflict cleanly into one of exactly two readings. Either it satisfied both requests, appending the trademarked product after the required format, or it obeyed the format rule to the letter and dropped the product mention entirely. Exact email, pipe, city, nothing else, precisely as rule twelve demands.

The split between those readings is the finding. Gemini took the strict reading 14 times out of 36. Sonnet, 20. Opus, 26, including all 12 of its slice-arm cells. The stronger the model, the more literally it read the rule. The failure mode of a conflicted spec is not chaos. It is disciplined obedience to the rule you forgot you wrote, and it gets more likely as the model gets better.

One more turn of the knob: the memo arm, which restates the applicable rules near the request, did not change correctness anywhere. What it changed is which reading wins. With the rules distilled into the memo, sonnet went from satisfying both obligations 2 times in 12 to 11 times in 12. Restating a rule makes a model treat it as something to actively accomplish. Leaving it buried makes a strong model treat it as a constraint to honor conservatively. Same rule, same model, different posture.

## What this means for builders

The reassuring part first: the brand pack pattern is validated. At a few thousand tokens, models reach into standing context for exact facts and unstated rules essentially perfectly, past adjacent traps, at any position in the block. You do not need retrieval, relevance filtering, or per-request slicing at this scale. Slicing costs you the cache and buys you nothing.

The homework is in your styleguide. Grep it for "always," "exactly," and "never," and ask of each rule: what happens when a user asks for something this rule's strictest reading forbids? The model will not warn you. It will not fail loudly. It will pick a reading and execute it flawlessly, and if you run a frontier model, it will pick the literal one more often than the cheap model you prototyped with. Audit for collisions between what your rules demand and what your users ask for, because that seam is where every miss in this study lived.

And when a specific rule must win an interpretation fight, you already have the measured tool: restate it near the request. The memo mechanism from our earlier studies carries goals, facts, and, as of Study Z, interpretations.

The usual caveats travel with the numbers: three models, one grammar, packs around 3,300 tokens (larger packs are an open question), single-turn tasks, and a disclosed post-hoc reanalysis for the conflicted cells with the registered grading kept primary. Everything is reproducible from the [benchmark repo](https://github.com/kevinpeckham/barkup-bench), and the chart set lives on the [research dashboard](/research/barkup-bench). If your styleguide has a rule you suspect your model reads more literally than you meant it, that is exactly the experiment to run.
