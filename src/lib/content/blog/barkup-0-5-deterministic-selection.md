---
title: "barkup 0.5: Your Code Finds the Targets Now"
metaTitle: "barkup 0.5 | Deterministic Selection"
slug: barkup-0-5-deterministic-selection
description: "barkup 0.5 ships selectNodes, a deterministic structural selector that enumerates every node matching an exact query. It is the smallest feature in the series and the best-measured: Study Q found that models leave multi-target edits partially complete under every strategy tested, and Study R found that splitting the job (code enumerates the targets, the model makes one small edit per node) ran 90 of 90 fan-out tasks with zero subtask failures at about a third of the cost. The principle: give deterministic work to deterministic code."
date: 2026-07-10T18:00:00Z
draft: false
tags: [ai, agents, llm, open-source, barkup]
image: https://lj-01.nyc3.cdn.digitaloceanspaces.com/images/blog/dog-04.webp
imageDescription: A watercolor painting of a scruffy brown terrier sitting in profile on a cream background, ears up, looking upward attentively
author: Kevin Peckham
quote:
  text: Give deterministic work to deterministic code, and give the model only the part that needs a model.
  attribution: Kevin Peckham, Principal at Lightning Jar
glossary:
  - term: Fan-out edit
    definition: "A single instruction that asks for the same change on every node matching a pattern, such as \"set textStyle to serif on every text-atom inside the atlas section\", where the model must find and edit all matching targets to succeed."
  - term: Decomposition
    definition: "Splitting a fan-out request into two jobs: application code deterministically enumerates the matching node ids, then the model receives one single-target edit request per node, each against a small focused view."
  - term: Deterministic selection
    definition: "The selectNodes utility: an exact structural query (type, name, attribute values, ancestor scope) that returns matching node ids in document order, with no scoring, no fuzziness, and the same answer every time."
  - term: Focused view
    definition: A rendering of a tree that shows the root-to-target path in full and represents everything else as id-bearing placeholders or honest omission counts, so the model sees only the region an edit concerns while every visible id remains a valid patch target.
  - term: Partial-coverage failure
    definition: "The characteristic fan-out failure mode: the model returns a legal, validated patch that edits some of the matching targets and stops, confident it is done."
additionalReading:
  - title: "Your Agent Doesn't Need a Memory: Two Worked Examples Replace Session History"
    url: "/blog/two-examples-replace-a-memory"
  - title: "barkup 0.4: The Model Finds the Node Now"
    url: "/blog/barkup-0-4-content-search"
  - title: "Then We Found the Cheap Part: One Search Call Grounds LLM Tree Edits"
    url: "/blog/then-we-found-the-cheap-part"
  - title: "Stable IDs Are All You Need: Seven Studies on Letting LLMs Edit Trees"
    url: "/blog/stable-ids-are-all-you-need"
  - title: "barkup-bench on GitHub: pre-registration, corpus, and raw analysis"
    url: "https://github.com/kevinpeckham/barkup-bench"
  - title: "@kevinpeckham/barkup on npm"
    url: "https://www.npmjs.com/package/@kevinpeckham/barkup"
---

[barkup](https://www.npmjs.com/package/@kevinpeckham/barkup) 0.5.0 is out. It adds one export to the `/view` module: `selectNodes`, deterministic structural selection. It is the smallest feature in the series so far, about forty lines, and it exists because the benchmark finally found the place where the right move is to stop asking the model entirely.

Version 0.4 shipped content search with a caveat attached: the search-then-patch recipe is a single-target recipe. Studies Q and R measured what happens beyond that boundary, when one instruction asks for the same change on every matching node ("set textStyle to serif on every text-atom inside atlas", anywhere from 2 to 32 targets). The results were bad enough, and the fix clean enough, that the fix is now a shipped utility.

## The failure

Study Q ran fan-out edits the tempting way, one prompt asking for one big patch, and every strategy degraded the same way. The model edits five of the fourteen matching nodes and stops, confident it is done. The patch is legal, it validates, it applies. It is just incomplete. Even with retrieval taken out of the picture entirely, with every target already visible in the prompt, both models tested left fan-out patches partially complete, and failing runs covered about a third of their targets on average. The shipped search recipe fared worst of all: a median of six search calls instead of one, and a third of runs past 100k input tokens.

Study R then tested the prompt-side rescues everyone reaches for. A complete worked fan-out example in the system prompt, the same technique that fully replaced session history in Study P, did not transfer to exhaustiveness. An explicit checklist instruction ("enumerate ALL matching nodes before patching") helped one model in one condition and still landed below that model's own baseline. Coverage is not a prompting problem.

## The fix: decomposition

Split the job in two.

**Your code finds the targets.** "Every text-atom inside the atlas section" is not a judgment call. It is a query. A short tree traversal answers it perfectly, instantly, for free, every single time. No model needed.

**The model makes one small edit at a time.** For each node your code found, send one tiny request ("set textStyle to serif on the node with id n417") along with a focused view of just that node. Apply the patch, move to the next target.

The principle underneath: give deterministic work to deterministic code, and give the model only the part that needs a model. Enumerating matches is deterministic work. Editing a node correctly is the model's job, and it is a job models do nearly perfectly when the task is small and specific.

Study R ran exactly this loop against the same 45 fan-out tasks that broke everything else: 674 individual single-target edits across both models. Every task succeeded, 90 of 90, including every task with 7 to 32 targets. Every subtask succeeded, 674 of 674. And because each request ships a roughly 2k-token view instead of the whole tree, the loop cost about a third of the one-big-prompt approach in input tokens. More model calls, but each one is small, cheap, and, at these task shapes, essentially infallible.

## The API

The one piece of that recipe applications previously wrote by hand is the enumeration step. barkup 0.5 ships it as `selectNodes`, the exact-match sibling of 0.4's fuzzy `findNodes`:

```ts
import { selectNodes } from "@kevinpeckham/barkup/view";

const targets = selectNodes(tree, {
	type: "text-atom",
	within: sectionId,
});

for (const id of targets) {
	// one single-target anchored edit per node,
	// against a focused view of that node
}
```

The query object takes four optional criteria, all ANDed: `type` (exact), `name` (exact), `attributes` (every listed key must be present with a deep-equal value), and `within` (restrict to strict descendants of a node id; the anchor itself never matches). An empty query matches every id-bearing node. Results come back in document order, the same depth-first pre-order that `findNodes` uses to break ties. An unknown `within` id selects nothing rather than throwing, matching `renderSearch`'s null-on-a-miss philosophy: a scope id can go stale between turns exactly like a search that stops matching, and selection is data, not an error.

The criteria compose into most of the queries a real application asks:

```ts
// every draft-styled text node, anywhere in the tree
selectNodes(tree, { type: "text-atom", attributes: { textStyle: "draft" } });

// every node named cta
selectNodes(tree, { name: "cta" });
```

There is no scoring, no top-5 cap, and no notion of a best match: `selectNodes` returns all matches or none. That is exactly the property fan-out needs, and exactly what fuzzy search cannot promise.

So the two utilities split the grounding problem cleanly, and the rule of thumb is worth stating. When a human phrase needs grounding ("the banner near the top"), the model plus `findNodes` is the measured recipe. When a rule needs enumerating ("every X inside Y"), `selectNodes` plus a loop of small single-target edits is, as of Study R, the best-measured recipe in the entire series. Fan-out requests belong to the second kind, which is the whole point: the moment a request says "every X", your application knows the query, and a query your application knows should never be delegated to a model's attention span.

## What we deliberately did not ship

No CSS-selector string syntax. The object form has zero parsing risk and covers everything Study R measured; a selector-string sugar would add a parser, a grammar, and a new class of quiet mismatches to a utility whose whole value is that it cannot be wrong. It may come later if real usage asks for it. And no fuzziness in `selectNodes` itself: if you need approximate matching, that is `findNodes`, and the two compose.

The usual caveats travel with the numbers: two models, a generated corpus, fan-out subtasks of two kinds (set an attribute, remove a node), and one pre-registered benchmark series behind all of it. Everything is reproducible from the [benchmark repo](https://github.com/kevinpeckham/barkup-bench), where Study R's brief was committed before its first scored run, like every study in the series. If you find a task shape where the decomposition loop breaks, we want the issue.
