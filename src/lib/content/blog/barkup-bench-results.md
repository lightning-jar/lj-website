---
title: "We Benchmarked It: What Held Up in 'HTML as a Native Data Format for LLMs', and What Didn't"
metaTitle: "We Benchmarked It | HTML vs JSON for LLMs"
slug: barkup-bench-results
description: "We pre-registered a benchmark to test the argument in 'HTML as a Native Data Format for LLMs': 9,600 scored runs across six conditions and four models. The whole-tree rewrite strategy won clearly, especially on multi-turn edits and smaller models. The HTML format itself was accuracy-neutral and only cheaper at scale. Mixed results, published as found."
date: 2026-07-06
draft: false
tags: [ai, agents, llm, benchmark, html]
image: https://lj-01.nyc3.cdn.digitaloceanspaces.com/images/blog/scale.webp
imageDescription: A watercolor painting of a balance scale
author: Kevin Peckham
quote:
  text: "The whole-tree rewrite strategy wins. The HTML format, by itself, doesn't."
  attribution: Kevin Peckham, Principal at Lightning Jar
glossary:
  - term: Pre-registered benchmark
    definition: A benchmark whose hypotheses, prompts, corpus seeds, and grading are committed to version control before any scored run, so the design cannot be tuned after the fact to flatter the result.
  - term: Whole-tree rewrite
    definition: An editing strategy where the model returns the entire artifact rewritten, rather than issuing granular mutations, so each edit is validated as one coherent whole.
  - term: Granular mutation tools
    definition: A tool API that edits a tree through small operations like insertNode and setAttribute, one call at a time, across a multi-turn conversation.
  - term: JSON Patch
    definition: A standard format (RFC 6902) for describing changes to a JSON document as a list of operations addressed by index-based paths.
  - term: First-pass validity
    definition: Whether the model's first attempt parses and validates with no correction rounds, measured identically for HTML and JSON in this benchmark.
  - term: McNemar test
    definition: A paired statistical test for whether two methods differ on the same set of tasks, used here to compare conditions run on identical inputs.
additionalReading:
  - title: "barkup 0.2: We Shipped What the Benchmark Told Us"
    url: "/blog/barkup-0-2-anchored-patches"
  - title: "HTML as a Native Data Format for LLMs: Why We Encode Our Data in Markup Instead of JSON"
    url: "/blog/ast-as-html"
  - title: "Content Is an Overlay: Separating Words from Structure in an AI Document Editor"
    url: "/blog/content-overlay"
  - title: "Why We Moved Our Document Production into Web Code: The Origin of Replicator"
    url: "/blog/replicator-origin"
---

Recently I made an argument and a promise. The argument: typed trees should be authored as an HTML dialect and edited by whole-tree rewrite, because models are fluent in markup and because granular mutation tools invite granular failure. The promise: we would benchmark it, publish the design before running it, and share the findings either way, good or bad. This is the companion to [HTML as a Native Data Format for LLMs](/blog/ast-as-html).

The findings are in. Some of the argument survived contact with the data. Some of it didn't. And the part that survived isn't quite the part I expected.

## The Short Version

**The whole-tree rewrite strategy wins. The HTML format, by itself, doesn't.**

Across 9,600 scored runs (200 procedurally generated tasks, five conditions plus a pre-registered sixth, four models from three vendors, two prompt regimes, every prompt and seed committed before the first scored call) rewriting the whole artifact beat granular mutation tools by 5.3 points overall and by **33 points** on multi-turn tasks where the agent had to reference a node from its own earlier output. But a scrupulously fair JSON twin of our setup (same grammar, same validator strictness, same error quality) rewrote trees just as accurately as the HTML dialect did. The win belongs to the *strategy*. The format is a wash on accuracy, and earns its keep elsewhere.

That's a mixed result for the article, and exactly the kind we committed to publishing.

![Line chart: task success rate versus tree size for six conditions. Whole-tree rewrite and id-anchored patches stay on top at every size; RFC 6902 JSON Patch drops to 69.6% at about 150 nodes.](/blog/img/crossover-success-light.svg)

*Task success by tree size, pooled over four models with parity prompts; whiskers are Wilson 95% intervals.*

## How We Kept It Honest

A benchmark like this is easy to rig by accident. The conventional arm gets a lazy validator, terse error messages, a schema the model has to guess at, and the "novel" approach wins by forfeit. So the JSON twin was built as the single most important fairness artifact in the project: a validator exactly as strict as barkup's, emitting the same issue codes, the same message wording, the same human-readable paths, cross-checked against an independently compiled JSON Schema in the test suite. The mutation-tool arm got real tools with realistic errors. The JSON Patch arm got a battle-tested RFC 6902 implementation so it could never lose to a bug in our patch engine.

Five conditions, one grammar semantics: **A** HTML plus whole-tree rewrite (the barkup approach), **B** JSON plus whole-tree rewrite, **C** JSON plus granular mutation tools (the textbook approach), **D** HTML plus the same tools, **E** JSON Patch. Hypotheses, prompts, corpus seeds, and grading were pre-registered by commit. Graders have their own unit tests. Models: claude-sonnet-4.5, gpt-5.4, gemini-3.5-flash, claude-haiku-4.5, temperature 0. Total damage: about $225 of API spend.

## Claim by Claim

**"LLMs have deep, pre-trained fluency in HTML": true, but no longer discriminating.** First-pass validity was at least 99.3% in every arm of every model, HTML and JSON alike. In 2026, frontier and mid-tier models emit both formats essentially perfectly at these sizes. Format fluency is real; it just stopped being a moat.

**"Ask for an inventory of an HTML tree and it reads the labels": not supported.** On exact-answer structural reading questions, HTML and JSON serializations tied: 87.1% vs 87.9%. The labels-on-the-outside intuition did not show up as measurable reading accuracy, at least up to trees of about 190 nodes.

**"Granular tools invite granular failure": strongly supported, with a mechanism I didn't predict.** Whole-tree rewrite beat mutation tools by +5.3 points overall (p < 0.0001) and +33 points on the multi-turn reference tasks. Here's the surprise: we logged *zero* stale-id failures. The referenced ids always survived. What actually happened, in every one of the 110 failures we audited, is that the smaller models simply never executed the follow-up edit. They made unrelated tool calls, or inserted a duplicate node instead of mutating the one they had just created, and then declared the job done. Multi-turn tool-calling is where small models quietly fall apart. A whole-artifact rewrite never exposes that surface: the edit is coherent or it's rejected, exactly as the article argued, for a reason the article didn't know about.

![Dot plot: multi-turn reference-edit success for four models across six conditions. gpt-5.4 and sonnet-4.5 score high everywhere; haiku-4.5 and gemini-3.5-flash drop to between 2.5% and 32.5% with mutation tools while id-anchored patches stay high.](/blog/img/reference-stability-light.svg)

*Multi-turn reference edits by model and condition. Whole-tree rewrite stays reliable; granular tools fall apart on the two smaller models.*

**And the crossover never came.** I expected rewrite to win on small trees and lose to tools as trees grew and rewriting got expensive and error-prone. It didn't reverse. Rewrite led at every size we tested, up to about 190 nodes. The gap narrowed at the top of the range, so a crossover may exist somewhere beyond it, but we didn't find it.

**"Fewer tokens burned": supported, with an asterisk.** Rewrite solved small and medium tasks with 4 to 5× fewer total tokens than tools (which re-send a growing conversation on every call). At 150 nodes it was still ahead. The asterisk: rewrite tokens are output tokens, which cost about 5× more each, and providers increasingly cache the tool arms' repeated inputs, so the *dollar* gap is narrower than the token gap. Here, finally, the format itself matters: the HTML dialect's terse attribute encoding made A about 30% cheaper than JSON rewrite on large trees (15.6k vs 23k tokens per solved task).

![Line chart: mean tokens per solved task by tree size. Mutation tools cost four to five times more on small trees; id-anchored patches are cheapest at every size, 13.2k tokens at about 150 nodes.](/blog/img/tokens-per-solved-light.svg)

*Mean tokens per solved task by tree size, parity prompts. Tool loops resend the growing conversation on every call.*

**One finding we weren't even looking for:** JSON Patch, the common middle ground, held its own through medium trees and then collapsed to 69.6% success at 150 nodes. Index-based paths (`/children/3/children/0/attributes/…`) are exactly the kind of positional arithmetic you shouldn't make a language model do at scale.

**And one follow-up experiment the data demanded.** If JSON Patch dies by index arithmetic, what happens when a patch addresses nodes by *id* instead? We pre-registered a sixth condition, an anchored-patch dialect where every operation names its target by id and placements anchor to sibling ids ("insert after `n7`") rather than positions, and ran it through the identical harness. It confirmed the diagnosis emphatically: anchored patches recovered the entire large-tree collapse (85.1% vs RFC 6902's 69.6%, p < 0.0001), matched whole-tree rewrite's success rate overall (92.6% vs 91.9%, statistically indistinguishable), and did it as the cheapest condition we measured: 13.2k tokens per solved 150-node task, 16% under rewrite. It was also a top-two condition for both of the smaller models. The catch: it only works if your pipeline guarantees stable node ids, which is exactly the guarantee a codec like barkup exists to provide.

**Who needs this advice?** The rewrite-vs-tools gap is a small-model phenomenon. gpt-5.4 and claude-sonnet-4.5 handled granular tools about as well as rewrite. claude-haiku-4.5 and gemini-3.5-flash were 10 to 11 points worse with tools than with rewrite. If your agents run on frontier models, either interface works today. If cost pressure ever pushes you down-tier, and it always eventually does, the rewrite interface is the one that degrades gracefully.

None of this is unprecedented, and it shouldn't be. Aider's [edit-format benchmarks](https://aider.chat/docs/leaderboards/) have long shown that whole-file editing outperforms diff-style formats, especially for less capable models, and the [Berkeley Function-Calling Leaderboard](https://gorilla.cs.berkeley.edu/leaderboard.html) documents how sharply multi-turn tool reliability varies by model. Our results line up with both. What this benchmark adds is the controlled separation of strategy from format: an equal-strictness JSON twin that lets us say the win belongs to whole-tree rewrite, not to HTML.

## So Why Are We Still Authoring in HTML?

Because accuracy was never the only budget, and the benchmark showed the format costs nothing on the budgets it measured.

The article's core claim about legibility, "legibility for the human author and fluency for the model are the same property," was only half testable, and the measurable half tied. What the benchmark can't score is the half we feel daily: a designer can read `<div data-type="text-atom" data-name="headline" data-max-length="60">` in a diff, in a code review, in a CMS debug view, without reconstructing a bracket stack in their head. One artifact serves the person and the agent. JSON-with-a-good-validator matches HTML for the model; it does not match it for the human standing next to the model.

Add the measured 30% token savings on large trees, identical accuracy, identical validity, and the guarantees a purpose-built codec gives you for free (byte-for-byte id preservation, round-trip identity, structured issues designed to be pasted back into a correction loop) and HTML-as-AST comes out of the benchmark not vindicated as magic, but validated as a sound default with zero measured downside and one unmeasured, decisive upside: people can read it.

What I'd say differently after the data: don't sell HTML as making your agents smarter. Sell whole-artifact rewrite as making your pipeline robust, especially below the frontier, and HTML as making the same artifact legible to everyone who has to live with it. And when token cost starts to bite, reach for id-anchored patches: the follow-up experiment says they keep rewrite's reliability at patch prices, riding on the id stability the codec already guarantees.

## The Receipts

Everything is open: the pre-registered brief (plus a second brief, `docs/BRIEF-F.md`, for the follow-up condition), corpus generators (seeded and committed), the fairness twin with its parity tests, the harness, the raw analysis, and the report, at [github.com/kevinpeckham/barkup-bench](https://github.com/kevinpeckham/barkup-bench). One command regenerates the corpus; one re-runs the matrix; one re-grades. If you run it on other models or bigger trees (the crossover question past 190 nodes is genuinely open) I'd love to see the numbers, whichever way they point.
