---
title: "barkup 0.4: The Model Finds the Node Now"
metaTitle: "barkup 0.4 | Content Search"
slug: barkup-0-4-content-search
description: "barkup 0.4 ships content search: three new exports in the /view module (findNodes, renderSearch, and the pre-registered SEARCH_PROMPT_RULES) let the model find its own target nodes from a plain-language request. Study N backed the feature before it shipped: oracle-level grounding on the frontier model and whole-tree-level on the cheap one, at a median of one search call and about a tenth of full-tree input, from a deterministic keyword scorer of about thirty lines. No embedding index shipped, because embeddings measured no better than keyword overlap."
date: 2026-07-09T18:00:00Z
draft: false
tags: [ai, agents, llm, open-source, barkup]
image: https://lj-01.nyc3.cdn.digitaloceanspaces.com/images/blog/dog-03.webp
imageDescription: A watercolor painting of a happy corgi wearing a black bow tie, mouth open and tongue out, facing the viewer
author: Kevin Peckham
quote:
  text: "So what shipped is the thing that measured well: deterministic, dependency-free keyword search, about thirty lines of code, benchmark numbers attached."
  attribution: Kevin Peckham, Principal at Lightning Jar
glossary:
  - term: Content search tool
    definition: "The find_nodes tool tested in Study N: the model supplies a few search words and gets back the five best-matching nodes rendered in place in the skeleton view, backed by a deliberately simple deterministic keyword overlap scorer."
  - term: Grounding
    definition: Resolving a human-style description such as "the image named maple-ember" to the id of the node an edit concerns, the retrieval step that the series' earlier oracle-bound studies deliberately skipped.
  - term: Focused view
    definition: A rendering of a tree that shows the root-to-target path in full and represents everything else as id-bearing placeholders or honest omission counts, so the model sees only the region an edit concerns while every visible id remains a valid patch target.
  - term: Skeleton view
    definition: A minimal rendering of a tree that shows only the upper levels as id-bearing collapsed placeholders with honest child counts, giving the model an addressable frame it can search or navigate toward a target.
  - term: Oracle bound
    definition: A deliberate benchmark simplification in which the task instruction names the target node ids explicitly, so the study measures editing against a view without also measuring how a real system would retrieve the relevant nodes from a vague request.
additionalReading:
  - title: "Your Agent Doesn't Need a Memory: Two Worked Examples Replace Session History"
    url: "/blog/two-examples-replace-a-memory"
  - title: "Then We Found the Cheap Part: One Search Call Grounds LLM Tree Edits"
    url: "/blog/then-we-found-the-cheap-part"
  - title: "barkup 0.3: Focused Views, or Why the Model Doesn't Need to See Your Tree"
    url: "/blog/barkup-0-3-focused-views"
  - title: "Stable IDs Are All You Need: Seven Studies on Letting LLMs Edit Trees"
    url: "/blog/stable-ids-are-all-you-need"
  - title: "barkup-bench on GitHub: pre-registration, corpus, and raw analysis"
    url: "https://github.com/kevinpeckham/barkup-bench"
  - title: "@kevinpeckham/barkup on npm"
    url: "https://www.npmjs.com/package/@kevinpeckham/barkup"
---

[barkup](https://www.npmjs.com/package/@kevinpeckham/barkup) 0.4.0 is out. It adds one small, heavily measured feature to the `/view` module: content search. Version 0.3 shipped focused views, which made editing nearly free once your application knew which node ids an edit concerned, and it shipped with an honest caveat attached: finding those ids was your problem. As of 0.4, the model can find them itself, with one tool call, and we can tell you exactly how well that works because we [benchmarked it before shipping it](/blog/then-we-found-the-cheap-part).

The short version of the evidence: give the model a minimal view of the tree's root and a `find_nodes` search tool, and it grounds plain-language edit requests ("rename the image named maple-ember") at oracle-level accuracy on the frontier model we tested and at whole-tree accuracy on the cheap one, at a median of a single search call and roughly a tenth of the input tokens of pasting the tree. The same study also measured the fashionable alternative, an embedding retriever, and found it no better than keyword matching on structural references. So what shipped is the thing that measured well: deterministic, dependency-free keyword search, about thirty lines of code, benchmark numbers attached.

## The API

Three new exports in `@kevinpeckham/barkup/view`, alongside the existing `renderView` and `VIEW_PROMPT_RULES`:

```ts
import {
	findNodes,
	renderSearch,
	SEARCH_PROMPT_RULES,
	NO_MATCHES_MESSAGE,
} from "@kevinpeckham/barkup/view";

// The scorer: distinct-keyword overlap against each node's type,
// name, and attributes. Returns the top ids (default 5), never
// zero-score filler.
const ids = findNodes(tree, "maple-ember image");
// ["n417", ...]

// The composition the benchmark actually scored: search, then render
// the matches in place with their ancestors, everything else
// collapsed. Returns null when nothing matches.
const result = renderSearch(grammar, tree, "maple-ember image");
if (result !== null && result.ok) {
	console.log(result.html);
}
```

Wiring it up as an agent tool is the whole integration. With the Vercel AI SDK it looks like this:

```ts
import { tool } from "ai";
import { z } from "zod";

const find_nodes = tool({
	description:
		"Search the tree by content: returns the best-matching nodes, shown in place with their ancestors.",
	inputSchema: z.object({ query: z.string() }),
	execute: async ({ query }) => {
		const result = renderSearch(grammar, tree, query);
		if (result === null) return NO_MATCHES_MESSAGE;
		if (!result.ok) throw new Error("view config error");
		return result.html;
	},
});
```

Append `SEARCH_PROMPT_RULES` to your system prompt (it is the exact pre-registered block the benchmark scored), show the model a minimal view of the root as its starting context, and let it search. The `NO_MATCHES_MESSAGE` export is the exact miss text from the benchmark harness; returning it teaches the model to reword rather than stall.

## The recipe, now in three tiers

The `/view` docs graduated from a caveat to a decision table:

- **Your app knows the ids.** Render the view directly. Studies I and J: accuracy statistically unchanged from full-tree input, at 1 to 2% of the tokens.
- **You only have a human description.** Skeleton view plus `find_nodes`. Study N: 43 of 45 on claude-sonnet-4.5 (equal to its ids-given oracle bound), 39 of 45 on gemini-3.5-flash (equal to its whole-tree score), median one search call.
- **Your patcher is expensive and your trees are big.** Ground with a cheap model first (full tree in, target ids out), then let the expensive model patch against the focused view. Study N's cross cell: accuracy held while the frontier model's median input dropped to about 1,500 tokens, a 97% reduction.

And the session guidance is unchanged by two further attempts to simplify it away: keep the full conversation history AND attach a fresh minimal view every turn. Stateless sessions failed the gate in Study M and failed it again in Study O with exact positions printed on every node.

## What we deliberately did not ship

No embedding index, no vector store, no async retrieval pipeline. Study N measured an off-the-shelf embedding retriever against the keyword scorer and it added nothing on this task family (target coverage 23 of 45 versus 24 of 45), so barkup ships the thing that is deterministic, synchronous, and reproducible. If your application needs semantic retrieval over prose-heavy trees, you can still do it: `renderView` accepts whatever focus ids your retriever produces.

The usual caveats travel with the numbers: two models, a generated corpus, trees of 300 to 1000 nodes, and one pre-registered benchmark series behind all of it. Everything is reproducible from the [benchmark repo](https://github.com/kevinpeckham/barkup-bench), including a disclosed tie-ordering divergence between the benched scorer and this shipped port (breadth-first versus document order on equal scores; the details are in the repo's REPORT.md). If you find more of those, we want the issue.

## Update: the fan-out boundary

We owed this release a stress test, and it found a real limit. Study Q ran the search-then-patch recipe against fan-out edits ("set textStyle to serif on every text-atom inside atlas", 2 to 32 targets per instruction). The single-target economics did not survive: a median of six search calls instead of one, a third of runs over 100k input tokens, and accuracy well below the whole-tree baseline on the cheap model. Even with retrieval taken out of the picture entirely, every model tested left fan-out patches partially complete. The recipe on this page is a single-target recipe. For "every X inside Y" requests, enumerate the targets in your application (one call to `findNodes` per your own query logic, or a plain tree traversal) and issue one single-target edit per node. The numbers are in [Your Agent Doesn't Need a Memory](/blog/two-examples-replace-a-memory) and the benchmark's REPORT.

Follow-up: Study R measured the decomposition path directly. One single-target edit per enumerated node ran 90 of 90 fan-out tasks on both models with zero subtask failures (674 of 674), at about a third of the input cost of a whole-tree prompt, while prompt-side fixes (a worked example, a coverage checklist) failed to close the gap. The boundary note above stands, and the workaround it recommends is now the best-measured recipe in the series. The enumeration step it requires now ships as `selectNodes` in [barkup 0.5](/blog/barkup-0-5-deterministic-selection).
