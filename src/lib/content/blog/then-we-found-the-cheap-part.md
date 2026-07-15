---
title: "Then We Found the Cheap Part: One Search Call Grounds LLM Tree Edits"
metaTitle: "Then We Found the Cheap Part: One Search Call Grounds LLM Tree Edits"
slug: then-we-found-the-cheap-part
description: "Two more pre-registered barkup-bench studies, one aimed at each of last week's failures. Study N replaced model-driven tree navigation with a single deterministic keyword search tool and the grounding trap disappeared: oracle-level accuracy at a median of one search call, the cheap model rescued from 23 of 45 to 39 of 45, input around a tenth of pasting the tree, and off-the-shelf embeddings adding nothing over keyword overlap. Study O printed exact positions on every view and stateless sessions still misplaced nodes, so keep the history. One gate opened, one stayed shut."
date: 2026-07-09T16:00:00Z
draft: false
tags: [ai, agents, llm, benchmark, barkup]
image: https://lj-01.nyc3.cdn.digitaloceanspaces.com/images/blog/dog-detective.webp
imageDescription: A watercolor painting of a beagle dressed as a detective in a deerstalker cap, tan trench coat, and green tie, standing upright and holding a magnifying glass
author: Kevin Peckham
quote:
  text: "Give the model a skeleton view and one deterministic content search tool. That is the whole recipe."
  attribution: Kevin Peckham, Principal at Lightning Jar
glossary:
  - term: Grounding
    definition: Resolving a human-style description such as "the image named maple-ember" to the id of the node an edit concerns, the retrieval step that the series' earlier oracle-bound studies deliberately skipped.
  - term: Skeleton view
    definition: A minimal rendering of a tree that shows only the upper levels as id-bearing collapsed placeholders with honest child counts, giving the model an addressable frame it can search or navigate toward a target.
  - term: Content search tool
    definition: "The find_nodes tool tested in Study N: the model supplies a few search words and gets back the five best-matching nodes rendered in place in the skeleton view, backed by a deliberately simple deterministic keyword overlap scorer."
  - term: Oracle bound
    definition: A deliberate benchmark simplification in which the task instruction names the target node ids explicitly, so the study measures editing against a view without also measuring how a real system would retrieve the relevant nodes from a vague request.
  - term: Stateless session
    definition: A multi-turn editing arrangement in which every turn is a fresh single-turn conversation containing only the current view of the tree and the instruction, with no accumulated conversation history.
  - term: Pre-registered benchmark
    definition: A benchmark whose hypotheses, prompts, corpus seeds, and grading are committed to version control before any scored run, so the design cannot be tuned after the fact to flatter the result.
additionalReading:
  - title: "Your Agent Doesn't Need a Memory: Two Worked Examples Replace Session History"
    url: "/blog/two-examples-replace-a-memory"
  - title: "barkup 0.4: The Model Finds the Node Now"
    url: "/blog/barkup-0-4-content-search"
  - title: "We Tried to Delete the Hard Parts. The Benchmark Said No."
    url: "/blog/the-benchmark-said-no"
  - title: "Stable IDs Are All You Need: Seven Studies on Letting LLMs Edit Trees"
    url: "/blog/stable-ids-are-all-you-need"
  - title: "barkup 0.3: Focused Views, or Why the Model Doesn't Need to See Your Tree"
    url: "/blog/barkup-0-3-focused-views"
  - title: "Your Agent's Session Is Drifting (and the Fix Is Cheaper Than the Bug)"
    url: "/blog/your-agents-session-is-drifting"
  - title: "barkup-bench on GitHub: pre-registration, corpus, and raw analysis"
    url: "https://github.com/kevinpeckham/barkup-bench"
---

[barkup-bench](https://github.com/kevinpeckham/barkup-bench) is our open, pre-registered benchmark series on a narrow question with broad consequences: what is the most reliable way to let an LLM agent edit structured data, like page layouts, document templates, and other typed trees? If you are new here, [Stable IDs Are All You Need](/blog/stable-ids-are-all-you-need) summarizes the arc so far.

Last week we published [a post about two failures](/blog/the-benchmark-said-no). We had tried to delete the two hard parts left in our recipe, and the benchmark refused both. Models could not find their own target nodes cheaply: reading the whole tree worked but cost a 7 to 9 point accuracy premium plus a full-tree read, our navigate-the-tree agent pattern was accurate only on the frontier model and cost more than the problem it solved, and naive keyword retrieval bottomed out at 60%. And editing sessions could not forget: take away conversation history and models started putting new nodes in the wrong place.

We ended that post saying the failure shapes were more useful than successes would have been. This week we cashed that claim in. Two more pre-registered studies, one aimed at each failure, and this time one gate passed. Emphatically.

## Study N: stop walking, start searching

Study L's navigation trap had a specific shape. The model got a skeleton view of the tree and an `expand_node` tool, and it wandered: a median of 54 expand calls per task, each one revealing one level of structure. The frontier model found its targets that way, at absurd cost. The cheap model got lost and ran out its budget.

But look at what the model was actually doing with all those expands: it was searching. Badly. Structure-walking is a terrible search algorithm when what you know about the target is its content: a name, a type, an attribute value. So Study N replaced the walking with the obvious thing. Same skeleton view, same budget, but the one tool is now `find_nodes`: give it a few search words, get back the five best-matching nodes shown in place in the tree. The matcher behind it is deliberately dumb, the same keyword overlap scorer that bottomed out at 60% when we used it blind. The difference is that now the model writes the query and sees the results in context.

The results, on the same 45 id-free tasks (300 to 1000 node trees):

| Success out of 45 | claude-sonnet-4.5 | gemini-3.5-flash |
|---|---|---|
| Oracle bound (ids given) | 43 | 41 |
| Whole tree in prompt | 39 | 38 |
| Navigate (expand_node) | 43 | 23 |
| **Search (find_nodes)** | **43** | **39** |

Three things worth staring at:

**One call.** The median task needed a single `find_nodes` call. Not 54 expands. Total input landed around 4k to 7k tokens per task, roughly 90% less than pasting the tree, at accuracy that matches the id-oracle on the frontier model (down to failing the same two tasks) and matches whole-tree grounding on the cheap one.

**The cheap model is fixed.** Navigation collapsed gemini to 23 of 45. Search lifts it to 39 of 45, exactly its whole-tree grounding score, at 3% of the cost. The pattern that was frontier-only is now tier-independent, which is the difference between a demo and something you can ship.

**The model is the retrieval system.** The same keyword matcher that scored 60% picking nodes by itself scores 87 to 96% when the model drives it, because the model can reformulate: query the name, miss, query the type, and read the results in context before patching. We also tested the fashionable upgrade, replacing keyword overlap with an embedding model, with no agent in the loop. It scored 24 and 25 of 45: statistically identical to the keyword floor. Off-the-shelf embeddings cannot resolve references like "the 3rd block inside the section named atlas" any better than string matching can. If you were about to add a vector store to solve this problem, measure first.

Study N also confirmed the economics of splitting the job in two. Have the cheap model read the full tree once and output just the target ids, then let the frontier model patch against a small focused view. Accuracy held at 41 of 45 while the frontier model's median input dropped to about 1,500 tokens per task, a 97% reduction in expensive-model spend. Grounding, it turns out, is cheap-model work: gemini named the right target nodes exactly as often as sonnet did.

## Study O: the null that sharpened a mechanism

The second failure from last week was statelessness. Every stateless-only session failure was a placement edit: a legal patch that put the new node in the wrong position. The obvious diagnosis was that without history, the model loses redundancy for counting siblings. So Study O tested the cheapest possible fix: print every child's true position on the view (`"position": 3`), tell the model exactly how positions map to the patch dialect's anchors, and rerun the stateless sessions.

It did not work. Stateless accuracy moved by a statistical whisker (3 to 1 discordant steps on sonnet, 1 to 0 on gemini), sessions ending byte-perfect stayed at 15 of 20 versus 19 of 20 with history, and models kept misplacing nodes that had the correct position printed on them. Whatever conversation history contributes to placement, it is not arithmetic the model failed to do. The gate failed, we publish it as failed, and the guidance from Study K stands unchanged: keep the full history and attach a fresh view every turn.

One consolation detail: positions plus history was descriptively the best configuration in the entire series (gemini finished 20 of 20 sessions byte-perfect), but not significantly better than history alone, so it ships as "harmless, possibly mildly helpful" rather than as a recommendation.

## What this changes

Last week's honest boundary was: finding the ids is your application's job, and it either costs a full-tree read or a retrieval system genuinely better than keyword matching. That boundary is now revised, and the revision is cheaper than we guessed:

- Give the model a skeleton view and one deterministic content search tool. That is the whole recipe. Oracle-level grounding on the frontier tier, whole-tree-level on the cheap tier, at about a tenth of full-tree cost.
- If your expensive model is the patcher, ground with a cheap model first. A 97% reduction in frontier-model input at equal accuracy.
- Do not reach for embeddings by default. Measured against structural references, they added nothing over keyword overlap.
- And sessions still need their history. Two studies have now tried to substitute cleverer views for memory, and both failed.

The search tool is shipping in [barkup](https://www.npmjs.com/package/@kevinpeckham/barkup) alongside the focused views it composes with. Everything else is reproducible from the [benchmark repo](https://github.com/kevinpeckham/barkup-bench): pre-registrations (BRIEF-N, BRIEF-O), the materialized retrieval file, unit-tested graders, raw analyses. Combined cost of both studies: about eighteen dollars, and this time, one of the two hypotheses we were fond of survived contact with the data.

## Update: one boundary opened, one closed

Two further studies sharpened both halves of this post. On sessions: Study P found that history's contribution is teaching, not memory. Two canned worked examples in the system prompt restore stateless sessions to full-history accuracy on both models, so the "keep the history" guidance above is no longer the only safe option. On search: Study Q stress-tested this post's recipe against fan-out edits ("change every X inside Y", 2 to 32 targets) and it did not survive: search spirals to a median of six calls, the cheap model loses 24 points against the full tree, and even perfect retrieval leaves models finishing only about half the target set. Fan-out wants app-side decomposition into single-target edits, not a cleverer prompt. Both studies are in [Your Agent Doesn't Need a Memory](/blog/two-examples-replace-a-memory).

One more boundary, measured later: the search tool grounds targets at oracle level, but it is not a reading tool. Study U asked models to copy a value from one node to another using search alone, and they managed 82 to 84%, significantly short of the whole-tree baseline on the cheap model and weakest exactly on value copies. When a request mentions a node the model must read, put that node in the view; let search answer where, and let your application supply what. The full result is in [The Two Things Your Agent Can't See](/blog/the-two-things-your-agent-cant-see).

And a tier note, July 2026: the recipe met the model we actually ship. Study AD ran the search arm on claude-opus-4.8 and it grounded 43 of 45, exactly sonnet's oracle bound, at a median of one search call and about 5.5k input tokens per task. The grounding recipe is now measured at the bound on both frontier tiers, and the boundaries above (fan-out, value reads) are unchanged. Charts on the [dashboard](/research/barkup-bench#sec-opus).
