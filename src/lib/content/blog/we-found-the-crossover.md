---
title: "We Found the Crossover (It Wasn't Where Anyone Looked)"
metaTitle: "We Found the Crossover | barkup-bench at 1000 Nodes"
slug: we-found-the-crossover
description: "We extended barkup-bench to trees of 300, 600, and 1000 nodes, with 45 fresh pre-registered editing tasks on two models. The crossover we went looking for exists, but not between the interfaces anyone was arguing about. Whole-tree rewrite becomes a frontier-model-only technique, positional JSON Patch keeps collapsing, and id-anchored patches hold 87 to 100 percent at every size, in seconds instead of minutes."
date: 2026-07-07T16:00:00Z
draft: false
tags: [ai, agents, llm, benchmark, barkup]
image: https://lj-01.nyc3.cdn.digitaloceanspaces.com/images/blog/bridge.webp
imageDescription: A watercolor painting of an arched stone footbridge with wrought-iron railings and steps
author: Kevin Peckham
quote:
  text: "The crossover exists. It just isn't between the interfaces anyone was arguing about."
  attribution: Kevin Peckham, Principal at Lightning Jar
glossary:
  - term: Crossover
    definition: The hypothesized tree size beyond which one editing interface stops being worth it and another overtakes it, the original motivating question of the barkup-bench series.
  - term: Whole-tree rewrite
    definition: An editing strategy where the model returns the entire artifact rewritten, rather than issuing granular mutations, so each edit is validated as one coherent whole.
  - term: Anchored patch
    definition: "A list of edit operations that address nodes by id, with insert and move placements anchored to sibling ids (before, after, or parentId), never by positional path."
  - term: RFC 6902 (JSON Patch)
    definition: The standard JSON patch format, which addresses nodes by index-based paths. It is the positional approach that collapsed on large trees in this benchmark.
  - term: Streaming transport
    definition: Receiving a model's response token by token as it is generated, instead of as one payload at the end. For multi-minute generations it is the difference between finishing and dying at a gateway timeout.
  - term: Pre-registered benchmark
    definition: A benchmark whose hypotheses, prompts, corpus seeds, and grading are committed to version control before any scored run, so the design cannot be tuned after the fact to flatter the result.
additionalReading:
  - title: "We Benchmarked It: What Held Up in 'HTML as a Native Data Format for LLMs', and What Didn't"
    url: "/blog/barkup-bench-results"
  - title: "barkup 0.2: We Shipped What the Benchmark Told Us"
    url: "/blog/barkup-0-2-anchored-patches"
  - title: "One Hidden Default Broke My Benchmark (and Maybe Your Agent)"
    url: "/blog/tool-history-footgun"
  - title: "barkup-bench on GitHub: pre-registration, corpus, and raw analysis"
    url: "https://github.com/kevinpeckham/barkup-bench"
---

***Series note:*** *Fourth post in the barkup-bench series, after [the benchmark](/blog/barkup-bench-results), [the shipped feature](/blog/barkup-0-2-anchored-patches), and [the footgun that humbled us](/blog/tool-history-footgun).*

When we pre-registered barkup-bench, one hypothesis felt safest: somewhere as trees grow, whole-tree rewrite (reply with the entire edited artifact) would stop being worth it, and finer-grained editing would overtake it. We called it the crossover, and we expected to find it between granular tool calls and rewrite.

The main study said: no crossover, up to ~190 nodes. Then the protocol correction said: even the gaps you *did* see were an artifact of your own conversation plumbing. By that point I'd have forgiven the crossover for not existing at all.

It exists. We found it by extending the benchmark to trees three to seven times larger: 300, 600, and 1000 nodes, 45 fresh pre-registered editing tasks, two models spanning the price spectrum. It just isn't between the interfaces anyone was arguing about.

## What happens at 1000 nodes

One edit request. A tree of about a thousand typed nodes. Three ways to reply: rewrite the whole artifact (with barkup's HTML dialect), send an RFC 6902 JSON Patch, or send an id-anchored patch. That last one is the dialect we shipped in barkup 0.2 after the earlier rounds of this benchmark: every operation names its target by stable id, and placements anchor to sibling ids, with no positional indexes anywhere.

| Success | ~300 nodes | ~600 | ~1000 |
|---|---|---|---|
| Whole-tree rewrite, claude-sonnet-4.5 | 15/15 | 14/15 | 12/15 |
| Whole-tree rewrite, gemini-3.5-flash | 9/15 | 5/15 | **0/15** |
| Anchored patch, sonnet | 15/15 | 15/15 | 13/15 |
| Anchored patch, gemini | 14/15 | 14/15 | 13/15 |
| RFC 6902, either model | ~53% | ~20% | ~10% |

![Line chart: task success at 300 to 1000 nodes. Anchored patches hold 87 to 100 percent for both models; whole-tree rewrite falls to zero for gemini-3.5-flash and 80 percent for claude-sonnet-4.5; RFC 6902 JSON Patch decays below 15 percent.](/blog/img/size-extension-light.svg)

*Task success by tree size, interface, and model, barkup-bench Study H: 45 pre-registered tasks across three sizes, protocol v2, n = 15 per cell.*

Three separate stories are hiding in that table.

**Whole-tree rewrite becomes a frontier-only technique.** Sonnet can genuinely do it. Twelve of fifteen thousand-node rewrites came back byte-faithful except the requested edit, which frankly exceeded my expectations. The cheap model can't do it at all, and its failure isn't loud: it produces plausible trees with quiet damage. If your agent rewrites large artifacts and your evals run on a frontier model, you're measuring a capability your production tier may not have. That's a cousin of the lesson from [the footgun post](/blog/tool-history-footgun).

**The pipe gives out before the model does.** A thousand-node rewrite is ~50,000 output tokens: ten minutes of generation. Unstreamed, every single one of sonnet's large rewrites died at the gateway mid-response. We had to switch the harness to streaming just to let the model finish a sentence ten minutes long. And when a rewrite failed and entered the retry loop, one task burned half a million tokens. There's a mechanical ceiling here that has nothing to do with intelligence.

**Anchored patches don't care.** Both models, every size, 87 to 100%. The patch for a thousand-node edit is a few dozen output tokens, so it completes in seconds, can't hit output ceilings, and failing cheaply is its worst case. Per solved thousand-node task: rewrite on sonnet cost $0.88 and 597 seconds; the anchored patch cost $0.26 and **four seconds**. On gemini it cost about four cents and two.

## The revised map

So the practical guidance, three studies and one correction later:

- **Up to ~200 nodes**: rewrite and anchored patches are statistically interchangeable on accuracy; rewrite is operationally simplest. (And with correct conversation history, granular tools are fine here too. That gap was our bug, not the models'.)
- **From ~300 nodes up**: anchored patches are the only interface that's simultaneously reliable across model tiers, fast, cheap, and free of transport ceilings.
- **Positional patch formats**: not above ~150 nodes, at any tier. Index arithmetic is the wrong job for a language model, and it gets worse with every level of nesting.

The through-line of the whole series is stable identity. Positional patches fail because positions are fragile. Rewrite at scale fails, when it fails, by drifting somewhere in fifty thousand tokens of faithful reproduction. Anchored patches work because every operation names a thing that cannot move out from under it: an id the codec guarantees byte-for-byte. That guarantee was barkup's founding obsession before any of this data existed. It's nice when the benchmark eventually explains why you cared.

Everything is reproducible from the repo: pre-registration ([BRIEF-H](https://github.com/kevinpeckham/barkup-bench/blob/main/docs/BRIEF-H.md)), corpus, seeds, raw analysis, and the streaming-transport protocol note, all at [barkup-bench](https://github.com/kevinpeckham/barkup-bench).
