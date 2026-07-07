---
title: "One Hidden Default Broke My Benchmark (and Maybe Your Agent)"
metaTitle: "One Hidden Default Broke My Benchmark | Tool-History Footgun"
slug: tool-history-footgun
description: "Every multi-turn failure in our benchmark traced back to one line of conversation plumbing: an SDK default that erased the model's own tool calls from its history. Small models collapsed, frontier models covered it up, and we published a phantom 33-point effect. Here's the bug, the controlled A/B that proved it, and the five-minute audit for your own agent."
date: 2026-07-06T16:00:00Z
draft: false
tags: [ai, agents, llm, benchmark, debugging]
image: https://lj-01.nyc3.cdn.digitaloceanspaces.com/images/blog/gun.webp
imageDescription: A watercolor painting of a revolver tied with a pink gingham bow
author: Kevin Peckham
quote:
  text: "Rigor didn't save us; reading the transcripts did."
  attribution: Kevin Peckham, Principal at Lightning Jar
glossary:
  - term: Conversation history
    definition: The full array of messages an agent re-sends to the model on every turn. It is the model's only memory; anything missing from it never happened, as far as the model is concerned.
  - term: Tool call / tool result
    definition: The structured request a model emits to invoke a tool, and the payload the harness sends back. In a correct history, both appear as parts of the assistant and tool messages for the turn in which they occurred.
  - term: Multi-step tool run
    definition: A single SDK call in which the model makes one or more tool calls, receives results, and finishes with a text reply. Each round is a step, and each step carries its own response messages.
  - term: Ablation study
    definition: A follow-up experiment that varies one factor at a time (conversation depth, mitigation prompts, fresh context) to isolate which mechanism actually causes an observed effect.
  - term: Pre-registered benchmark
    definition: A benchmark whose hypotheses, prompts, corpus seeds, and grading are committed to version control before any scored run, so the design cannot be tuned after the fact to flatter the result.
additionalReading:
  - title: "We Found the Crossover (It Wasn't Where Anyone Looked)"
    url: "/blog/we-found-the-crossover"
  - title: "We Benchmarked It: What Held Up in 'HTML as a Native Data Format for LLMs', and What Didn't"
    url: "/blog/barkup-bench-results"
  - title: "HTML as a Native Data Format for LLMs: Why We Encode Our Data in Markup Instead of JSON"
    url: "/blog/ast-as-html"
  - title: "barkup 0.2: We Shipped What the Benchmark Told Us"
    url: "/blog/barkup-0-2-anchored-patches"
---

***Companion note:*** *This piece follows [We Benchmarked It](/blog/barkup-bench-results) and [HTML as a Native Data Format for LLMs](/blog/ast-as-html), but this one isn't about markup. It's about a single line of conversation plumbing that quietly decides whether small models can do multi-turn tool calling at all.*

Here's a transcript from our benchmark. The model has just created a node with a tool call; the system assigned it id `m1` and told the model so. One turn later, we ask for the simplest edit imaginable:

> **User:** Set the "requireBleed" attribute to true on the node with id "m1" (the widget-slot you created in the previous step). Make the changes with the tools, then reply DONE.

> **Assistant:** DONE

No tool call. No edit. Just: DONE. A cheerful, confident lie.

We had 114 of these. Every failing case in our multi-turn editing tasks looked exactly like this: correct instruction in, zero action out, "DONE." The smaller the model, the worse it got: gemini-3.5-flash failed 96% of these follow-ups, claude-haiku-4.5 failed 71%, while gpt-5.4 and claude-sonnet-4.5 sailed through. We published the finding with a number on it: whole-tree rewrite beat granular tool calling by 33 points on multi-turn edits. We had a tidy story about small models and multi-turn fragility.

The story was wrong. Not the data: the data was real, reproducible, temperature-zero real. The *interpretation* was wrong, and the way we found out is the most useful thing this benchmark ever produced.

## Results too weird to trust

Because the failure mode was so strange (models that execute an instruction flawlessly in turn one, then ignore the identical instruction shape in turn three), we pre-registered a follow-up study to isolate the mechanism. Conversation depth. Mitigation prompts. A fresh-context control. Six models, 2,160 cells.

The ablations came back *weird*. Depth didn't behave: some models got better with more intervening turns, some worse, no coherent curve. A "restate the instruction before acting" mitigation (the kind of prompt hygiene everyone recommends) made gpt-5.4 collapse from 100% to 7.5%. Meanwhile a fresh conversation fixed every model, instantly, universally.

Results that incoherent usually mean you're not measuring what you think you're measuring. So I went to read the raw conversation histories we were sending, not the ones I assumed we were sending.

## The bug

Our harness used the AI SDK (v7). After each tool-calling turn, it appended the result to the running conversation like this:

```ts
messages.push(...result.response.messages); // looks right. isn't.
```

Here's the thing: in a multi-step tool run, `result.response.messages` contains **only the final step's assistant text**. The tool calls the model made, and the tool results it received, live one level down, per step. What you actually want is:

```ts
messages.push(...result.responseMessages); // the idiomatic v7 accessor

// equivalent, built from the per-step data:
messages.push(...result.steps.flatMap((s) => s.response.messages));
```

And what makes this a *migration* trap rather than a plain bug: `result.response.messages` was the documented v5 pattern for exactly this purpose. v7 kept the property, changed its meaning to final-step-only, and moved the accumulated history to a new top-level accessor, [`result.responseMessages`](https://ai-sdk.dev/docs/migration-guides/migration-guide-7-0). It is documented in the migration guide, but silent at the call site. No compile error. No runtime signal. (The property does carry a `@deprecated` JSDoc note: a strikethrough for humans in editors, invisible to CI, to generated code, and to anyone not hovering.) Code written against v5 still typechecks, still runs, and quietly means something else. Crueler still: the pattern v7 demoted is the very one the [4.0 migration guide](https://ai-sdk.dev/docs/migration-guides/migration-guide-4-0) told everyone to adopt: 4.0 deprecated `responseMessages` in favor of `response.messages`, and v7 moved the accumulated history back to `responseMessages`. The name has switched meanings twice. We've reported this upstream with a proposed dev-time warning: [vercel/ai#16840](https://github.com/vercel/ai/issues/16840).

One line. But with the first version, every multi-turn conversation we ran had a hole in it: the model's own tool activity was erased from its history. From the model's point of view, the past looked like this: *user asked for an edit; I replied "DONE."* No insertNode call. No tool result with the new id. Just a user request and a one-word answer that apparently satisfied everyone.

Read that transcript again with the model's eyes and the behavior stops being mysterious. It isn't ignoring your instruction. It's continuing the only pattern its context contains.

## The controlled proof

Because the follow-up study was already built, re-running it with corrected histories gave us something rare: a perfect A/B of one plumbing decision, 2,160 cells per protocol, same tasks, same models, same prompts.

With the model's tool calls hidden from history, follow-up execution ranged from 5% to 100% depending on model and configuration. With correct history: **100%. Every model. Every arm. Every depth. 2,160 for 2,160.**

On the original benchmark's multi-turn tasks (tools conditions, pooled):

| Model | Broken history | Corrected history |
|---|---|---|
| gemini-3.5-flash | 3.8% | 71.3% |
| claude-haiku-4.5 | 28.7% | 98.8% |
| claude-sonnet-4.5 | 96.3% | 100% |
| gpt-5.4 | 96.3% | 100% |

![Dumbbell chart: multi-turn reference-edit success per model with the model's own tool calls hidden from history versus corrected history. gemini-3.5-flash rises from 3.8% to 71.3%, haiku-4.5 from 28.7% to 98.8%; sonnet-4.5 and gpt-5.4 barely move.](/blog/img/tool-history-footgun-light.svg)

*Multi-turn reference-edit success by model, tools conditions pooled: the model's own tool calls hidden from history versus corrected history.*

Same tasks. Same models. Same prompts. The only thing that changed is whether the conversation history contained the model's own tool calls.

## Why you probably wouldn't catch it

Look at the bottom two rows of that table. The frontier models barely notice the defect. They act on the current instruction no matter how odd the history looks, which sounds like a virtue, and is, right up until it becomes camouflage.

Because here's the standard lifecycle of an agent feature: you build it against a frontier model, your evals pass, you ship. Six months later someone points out the assistant endpoint would be 20× cheaper on a small model, and the evals (run on the frontier model) still pass. The defect has been sitting in your history construction the whole time, invisible, waiting for the model swap to detonate it. The failure it produces doesn't throw, doesn't log, and doesn't look like an error. It looks like a cheerful "DONE."

And one more trap from our ablations: prompt mitigations interact with the broken history in model-specific, catastrophic ways: that restate-first instruction took gpt-5.4 from 100% to 7.5% *under the broken history* and was harmless under the correct one. If you've ever seen a prompt tweak inexplicably nuke one model's tool use, audit your history before you blame the prompt.

## The five-minute audit

1. **Dump the exact message array you send on turn N+1** of a tool-using conversation, not what your abstraction claims, the actual array. Look for `tool-call` and `tool-result` parts from turn N. If your assistant turns are all bare text, you have the bug.
2. **Check your persistence layer.** The SDK-level fix is `result.responseMessages` (the official accumulated-history accessor) or the equivalent `steps.flatMap(s => s.response.messages)`, but the same hole opens one layer up: if your conversation store saves only the assistant's visible text (very common: that's what the user sees), every rebuilt history is tool-less no matter what the SDK returned.
3. **Add one regression test**: run a two-turn tool conversation; assert the rebuilt history for turn two contains at least one tool-call part and one tool-result part. It's the cheapest insurance in agent engineering.
4. **Re-run your evals on your cheapest model, not your best one.** Small models are your canary for context defects. If haiku-class models suddenly can't follow up, don't conclude they're bad at tools: we did, in public, with confidence intervals.

There's also a structural way out: interfaces where the model's work product *is* its visible reply (whole-artifact rewrite, patch formats) are immune to this entire failure class. There's no hidden tool channel to lose. In our corrected benchmark, tools and rewrite perform within a couple of points of each other; the honest argument for whole-artifact designs is no longer accuracy, it's that they have strictly less plumbing that can silently fail.

## What it cost us

We'd published numbers this bug manufactured: "+5.3 points for rewrite over tools," "+33 points on multi-turn edits," "tool fragility is a small-model problem." Corrected: tools and rewrite are at parity (tools actually edge ahead by 2 points); the multi-turn gap is gone; haiku's tool score jumped from 80.5% to 95% without haiku changing at all. The corrections are live in [the benchmark repo](https://github.com/kevinpeckham/barkup-bench) and annotated in both earlier posts, with the original claims left visible: that's what pre-registration and publishing-either-way are for. The findings that survive (format-fluency parity, token economics, positional JSON Patch collapsing on big trees, id-anchored patches matching rewrite at the lowest cost) survive *because* the protocols they ran under never touched the broken code path.

One last, slightly uncomfortable thought. Multi-turn tool benchmarks are everywhere right now, and every one of them constructs conversation histories in framework code that nobody's results section describes. Our +33-point phantom effect had confidence intervals, p-values, temperature 0, and 8,000 scored runs behind it. Rigor didn't save us; reading the transcripts did. If you maintain a multi-turn eval (or trust one), it's worth an afternoon to go look at what your models actually see.
