---
title: "We Benchmarked It: What Held Up in 'HTML as a Native Data Format for LLMs', and What Didn't"
metaTitle: "We Benchmarked It | HTML vs JSON for LLMs"
slug: barkup-bench-results
description: "We pre-registered a benchmark to test the argument in 'HTML as a Native Data Format for LLMs': 9,600 scored runs across six conditions and four models. Corrected July 2026: a harness defect had hidden the models' own tool calls from multi-turn history, manufacturing the original rewrite-vs-tools gaps. With correct history, no interface dominates on accuracy; the cost findings and JSON Patch's large-tree collapse stand. Mixed results and corrections, published as found."
date: 2026-07-06
draft: false
tags: [ai, agents, llm, benchmark, html]
image: https://lj-01.nyc3.cdn.digitaloceanspaces.com/images/blog/scale.webp
imageDescription: A watercolor painting of a balance scale
author: Kevin Peckham
quote:
  text: "The dramatic gaps weren't the models. They were one line of conversation-history code."
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
  - term: Protocol v2
    definition: The corrected benchmark protocol in which the model's own tool-call and tool-result messages are included in multi-turn conversation history, fixing a harness defect that had silently hidden them.
additionalReading:
  - title: "We Found the Crossover (It Wasn't Where Anyone Looked)"
    url: "/blog/we-found-the-crossover"
  - title: "A Deprecated Accessor That Still Typechecks Broke My Benchmark (and Maybe Your Agent)"
    url: "/blog/tool-history-footgun"
  - title: "barkup 0.2: We Shipped What the Benchmark Told Us"
    url: "/blog/barkup-0-2-anchored-patches"
  - title: "HTML as a Native Data Format for LLMs: Why We Encode Our Data in Markup Instead of JSON"
    url: "/blog/ast-as-html"
  - title: "Content Is an Overlay: Separating Words from Structure in an AI Document Editor"
    url: "/blog/content-overlay"
  - title: "Why We Moved Our Document Production into Web Code: The Origin of Replicator"
    url: "/blog/replicator-origin"
---

## Correction (July 6, 2026)

**After publishing this post we found a defect in our benchmark harness, and the headline interface-reliability findings below did not survive the fix.** Our tools loop built multi-turn conversation history from the AI SDK's `response.messages`, which silently omits tool-call and tool-result messages, so in every multi-turn tools conversation, the model was shown a history in which its own tool activity was invisible. Re-running the affected cells with correct history ("protocol v2") eliminated the gaps this post led with: whole-tree rewrite vs granular tools overall is now 91.9% vs 93.9% (a slight *tools* edge, −2.0 points, p = 0.04; originally +5.3 points for rewrite); the +33-point multi-turn reference gap becomes −3.1 points and is not significant (88.1% vs 91.3%); and the "small models fall apart with tools" pattern is gone (claude-haiku-4.5 with tools: 80.5% → 95.0%; gemini-3.5-flash: 75.5% → 88.5%, its modest remaining deficit traced to first-phase tool accuracy, not follow-up dropout).

What stands, unaffected by the defect: every cost finding (rewrite and patches solve small and medium tasks with 4 to 5× fewer tokens than tools, and HTML stays about 30% terser than JSON at scale), the format null results (validity ≥99% and reading accuracy tied across HTML and JSON), RFC 6902 JSON Patch's collapse to 69.6% at about 150 nodes, and every id-anchored-patch result: anchored patches still tie whole-tree rewrite at the lowest cost measured.

And the new headline finding is the defect itself: one line of history handling silently collapses small-model multi-turn tool reliability while frontier models mask it. With their own tool calls hidden from history, gemini-3.5-flash completed 3.8% of multi-turn reference edits and haiku-4.5 28.7%; with correct history, 71.3% and 98.8%, while sonnet-4.5 and gpt-5.4 barely moved. A pre-registered 2,160-cell follow-up study passes every cell, for every model, at every depth under corrected history. If a small model "can't do multi-turn tool calling," audit the conversation history your framework actually sends before concluding anything about the model. The figures below now carry corrected, protocol-v2 data; the original text is preserved with inline corrections as the record of what we got wrong. Full corrected report: [barkup-bench](https://github.com/kevinpeckham/barkup-bench). The full story of the defect, and the five-minute audit for your own agent: [A Deprecated Accessor That Still Typechecks Broke My Benchmark (and Maybe Your Agent)](/blog/tool-history-footgun).

![Dumbbell chart: multi-turn reference-edit success per model with the model's own tool calls hidden from history versus corrected history. gemini-3.5-flash rises from 3.8% to 71.3%, haiku-4.5 from 28.7% to 98.8%; sonnet-4.5 and gpt-5.4 barely move.](/blog/img/tool-history-footgun-light.svg)

*The same benchmark under two histories: the model's own tool calls hidden from the conversation (the SDK default we shipped) versus corrected history (protocol v2).*

---

## The Original Post, As Published

Recently I made an argument and a promise. The argument: typed trees should be authored as an HTML dialect and edited by whole-tree rewrite, because models are fluent in markup and because granular mutation tools invite granular failure. The promise: we would benchmark it, publish the design before running it, and share the findings either way, good or bad. This is the companion to [HTML as a Native Data Format for LLMs](/blog/ast-as-html).

The findings are in. Some of the argument survived contact with the data. Some of it didn't. And the part that survived isn't quite the part I expected.

## The Short Version

**The whole-tree rewrite strategy wins. The HTML format, by itself, doesn't.** (*Correction, July 2026: the first sentence did not survive the harness fix described above: with correct tool history, rewrite vs tools is 91.9% vs 93.9%, a slight tools edge. The second sentence held.*)

Across 9,600 scored runs (200 procedurally generated tasks, five conditions plus a pre-registered sixth, four models from three vendors, two prompt regimes, every prompt and seed committed before the first scored call) rewriting the whole artifact beat granular mutation tools by 5.3 points overall and by **33 points** on multi-turn tasks where the agent had to reference a node from its own earlier output. But a scrupulously fair JSON twin of our setup (same grammar, same validator strictness, same error quality) rewrote trees just as accurately as the HTML dialect did. The win belongs to the *strategy*. The format is a wash on accuracy, and earns its keep elsewhere. (*Correction, July 2026: the +5.3- and 33-point gaps were manufactured by the tool-history defect. Under protocol v2 the tools arm is slightly ahead overall (−2.0 points, p = 0.04) and the multi-turn gap is −3.1 points, not significant. "The format is a wash on accuracy" stands.*)

That's a mixed result for the article, and exactly the kind we committed to publishing.

![Line chart: task success rate versus tree size for six conditions, protocol v2. No interface dominates; whole-tree rewrite, granular tools, and id-anchored patches land within a few points at every size, while positional RFC 6902 JSON Patch is the outlier at scale, dropping to 69.6% at about 150 nodes.](/blog/img/crossover-success-light.svg)

*Task success by tree size, pooled over four models with parity prompts, protocol v2 (corrected tool history); whiskers are Wilson 95% intervals.*

## How We Kept It Honest

A benchmark like this is easy to rig by accident. The conventional arm gets a lazy validator, terse error messages, a schema the model has to guess at, and the "novel" approach wins by forfeit. So the JSON twin was built as the single most important fairness artifact in the project: a validator exactly as strict as barkup's, emitting the same issue codes, the same message wording, the same human-readable paths, cross-checked against an independently compiled JSON Schema in the test suite. The mutation-tool arm got real tools with realistic errors. The JSON Patch arm got a battle-tested RFC 6902 implementation so it could never lose to a bug in our patch engine.

Five conditions, one grammar semantics: **A** HTML plus whole-tree rewrite (the barkup approach), **B** JSON plus whole-tree rewrite, **C** JSON plus granular mutation tools (the textbook approach), **D** HTML plus the same tools, **E** JSON Patch. Hypotheses, prompts, corpus seeds, and grading were pre-registered by commit. Graders have their own unit tests. Models: claude-sonnet-4.5, gpt-5.4, gemini-3.5-flash, claude-haiku-4.5, temperature 0. Total damage: about $225 of API spend.

## Claim by Claim

**"LLMs have deep, pre-trained fluency in HTML": true, but no longer discriminating.** First-pass validity was at least 99.3% in every arm of every model, HTML and JSON alike. In 2026, frontier and mid-tier models emit both formats essentially perfectly at these sizes. Format fluency is real; it just stopped being a moat.

**"Ask for an inventory of an HTML tree and it reads the labels": not supported.** On exact-answer structural reading questions, HTML and JSON serializations tied: 87.1% vs 87.9%. The labels-on-the-outside intuition did not show up as measurable reading accuracy, at least up to trees of about 190 nodes.

**"Granular tools invite granular failure": strongly supported, with a mechanism I didn't predict.** Whole-tree rewrite beat mutation tools by +5.3 points overall (p < 0.0001) and +33 points on the multi-turn reference tasks. Here's the surprise: we logged *zero* stale-id failures. The referenced ids always survived. What actually happened, in every one of the 110 failures we audited, is that the smaller models simply never executed the follow-up edit. They made unrelated tool calls, or inserted a duplicate node instead of mutating the one they had just created, and then declared the job done. Multi-turn tool-calling is where small models quietly fall apart. A whole-artifact rewrite never exposes that surface: the edit is coherent or it's rejected, exactly as the article argued, for a reason the article didn't know about. (*Correction, July 2026: this entire finding was the harness defect. Our loop hid the model's own tool calls from the conversation history, so the models never saw the inserts they were asked to follow up on. With correct history the multi-turn comparison is 88.1% vs 91.3% (not significant, and nominally favoring tools) and the small models are no longer the ones falling apart. "Zero stale-id failures" remains true in every arm under both protocols.*)

![Dot plot: multi-turn reference-edit success for four models across six conditions, protocol v2. Every interface is near parity within each model; positional JSON Patch is the weakest and id-anchored patches stay high.](/blog/img/reference-stability-light.svg)

*Multi-turn reference edits by model and condition, protocol v2 (corrected tool history): near parity across interfaces, with zero stale-id failures in any arm.*

**And the crossover never came.** I expected rewrite to win on small trees and lose to tools as trees grew and rewriting got expensive and error-prone. It didn't reverse. Rewrite led at every size we tested, up to about 190 nodes. The gap narrowed at the top of the range, so a crossover may exist somewhere beyond it, but we didn't find it. (*Correction, July 2026: under protocol v2 rewrite does not lead: no size bucket shows a significant rewrite-vs-tools difference, and tools are nominally ahead on medium and large trees. There is still no crossover to find, because there is no longer a gap to cross.*)

***Update (July 2026):*** *A pre-registered follow-up at 300 to 1000 nodes found the crossover: above about 300 nodes, whole-tree rewrite becomes frontier-model-only (gemini-3.5-flash solved 0 of 15 rewrite tasks at about 1000 nodes) and slow, while id-anchored patches held 87 to 100% at every size for both models — about $0.26 and 4 seconds per solved ~1000-node edit, versus rewrite's $0.88 and 597 seconds. Details in [We Found the Crossover](/blog/we-found-the-crossover) and the [barkup 0.2 post](/blog/barkup-0-2-anchored-patches) update.*

**"Fewer tokens burned": supported, with an asterisk.** Rewrite solved small and medium tasks with 4 to 5× fewer total tokens than tools (which re-send a growing conversation on every call). At 150 nodes it was still ahead. The asterisk: rewrite tokens are output tokens, which cost about 5× more each, and providers increasingly cache the tool arms' repeated inputs, so the *dollar* gap is narrower than the token gap. Here, finally, the format itself matters: the HTML dialect's terse attribute encoding made A about 30% cheaper than JSON rewrite on large trees (15.6k vs 23k tokens per solved task).

![Line chart: mean tokens per solved task by tree size. Mutation tools cost four to five times more on small trees; id-anchored patches are cheapest at every size, 13.2k tokens at about 150 nodes.](/blog/img/tokens-per-solved-light.svg)

*Mean tokens per solved task by tree size, parity prompts. Tool loops resend the growing conversation on every call.*

**One finding we weren't even looking for:** JSON Patch, the common middle ground, held its own through medium trees and then collapsed to 69.6% success at 150 nodes. Index-based paths (`/children/3/children/0/attributes/…`) are exactly the kind of positional arithmetic you shouldn't make a language model do at scale.

**And one follow-up experiment the data demanded.** If JSON Patch dies by index arithmetic, what happens when a patch addresses nodes by *id* instead? We pre-registered a sixth condition, an anchored-patch dialect where every operation names its target by id and placements anchor to sibling ids ("insert after `n7`") rather than positions, and ran it through the identical harness. It confirmed the diagnosis emphatically: anchored patches recovered the entire large-tree collapse (85.1% vs RFC 6902's 69.6%, p < 0.0001), matched whole-tree rewrite's success rate overall (92.6% vs 91.9%, statistically indistinguishable), and did it as the cheapest condition we measured: 13.2k tokens per solved 150-node task, 16% under rewrite. It was also a top-two condition for both of the smaller models. (*Correction, July 2026: with the harness fixed, the smaller models are no longer fragile with tools, so this particular "bonus" dissolved into general parity; the reliability and cost results in this paragraph are unaffected by the defect and stand as written.*) The catch: it only works if your pipeline guarantees stable node ids, which is exactly the guarantee a codec like barkup exists to provide.

***Update (July 2026):*** *A second pre-registered follow-up (Study I) varied the input instead of the output: it replaced the full tree in the prompt with a focused view — the path to the target rendered fully, everything else collapsed to id-bearing placeholders — while the anchored patches still applied to the full tree. Accuracy matched full input on every paired comparison (claude-sonnet-4.5 on the most aggressive view went a perfect 45 for 45), at 2 to 4% of the input cost: median input per ~1000-node task fell from 85,642 tokens to 3,500, or 1,531 for the minimal view. That minimal view's input grows with tree depth rather than node count, which effectively removes the context-window ceiling for id-addressed edits.*

**Who needs this advice?** The rewrite-vs-tools gap is a small-model phenomenon. gpt-5.4 and claude-sonnet-4.5 handled granular tools about as well as rewrite. claude-haiku-4.5 and gemini-3.5-flash were 10 to 11 points worse with tools than with rewrite. If your agents run on frontier models, either interface works today. If cost pressure ever pushes you down-tier, and it always eventually does, the rewrite interface is the one that degrades gracefully. (*Correction, July 2026: this paragraph was wrong. The 10-to-11-point small-model deficit was our tool-history defect, not the models. With correct history, haiku-4.5 scores 95.0% and gemini-3.5-flash 88.5% with tools. The advice that survives is different: whole-artifact interfaces are structurally immune to the history-construction mistake that produced these numbers, a mistake frontier models mask and cheaper models expose.*)

None of this is unprecedented, and it shouldn't be. Aider's [edit-format benchmarks](https://aider.chat/docs/leaderboards/) have long shown that whole-file editing outperforms diff-style formats, especially for less capable models, and the [Berkeley Function-Calling Leaderboard](https://gorilla.cs.berkeley.edu/leaderboard.html) documents how sharply multi-turn tool reliability varies by model. Our results line up with both. What this benchmark adds is the controlled separation of strategy from format: an equal-strictness JSON twin that lets us say the win belongs to whole-tree rewrite, not to HTML. (*Correction, July 2026: the controlled separation held up better than the conclusion: under protocol v2 it shows that neither the strategy nor the format wins on accuracy. And the sharp model-to-model variation in multi-turn tool reliability that benchmarks like BFCL document is, our experience suggests, worth auditing for history-construction artifacts.*)

## So Why Are We Still Authoring in HTML?

Because accuracy was never the only budget, and the benchmark showed the format costs nothing on the budgets it measured.

The article's core claim about legibility, "legibility for the human author and fluency for the model are the same property," was only half testable, and the measurable half tied. What the benchmark can't score is the half we feel daily: a designer can read `<div data-type="text-atom" data-name="headline" data-max-length="60">` in a diff, in a code review, in a CMS debug view, without reconstructing a bracket stack in their head. One artifact serves the person and the agent. JSON-with-a-good-validator matches HTML for the model; it does not match it for the human standing next to the model.

Add the measured 30% token savings on large trees, identical accuracy, identical validity, and the guarantees a purpose-built codec gives you for free (byte-for-byte id preservation, round-trip identity, structured issues designed to be pasted back into a correction loop) and HTML-as-AST comes out of the benchmark not vindicated as magic, but validated as a sound default with zero measured downside and one unmeasured, decisive upside: people can read it.

What I'd say differently after the data: don't sell HTML as making your agents smarter. Sell whole-artifact rewrite as making your pipeline robust, especially below the frontier, and HTML as making the same artifact legible to everyone who has to live with it. (*Correction, July 2026: revise that once more: rewrite's robustness edge is not a measured success gap but a structural one. Whole-artifact interfaces cannot be broken by the conversation-history mistake we ourselves made, and granular tool loops can.*) And when token cost starts to bite, reach for id-anchored patches: the follow-up experiment says they keep rewrite's reliability at patch prices, riding on the id stability the codec already guarantees.

## The Receipts

Everything is open: the pre-registered briefs (`docs/BRIEF-F.md` for the follow-up condition, `docs/BRIEF-G.md` for the tool-history study, `docs/BRIEF-H.md` for the size extension, `docs/BRIEF-I.md` for the focused-view study), corpus generators (seeded and committed), the fairness twin with its parity tests, the harness, the raw analysis (including both the original v1 records and the corrected protocol-v2 re-runs, so the defect itself is reproducible as a controlled ablation) and the report, at [github.com/kevinpeckham/barkup-bench](https://github.com/kevinpeckham/barkup-bench). One command regenerates the corpus; one re-runs the matrix; one re-grades. If you run it on other models or even bigger trees, I'd love to see the numbers, whichever way they point. (We took our own advice: the size-extension follow-up at 300 to 1000 nodes found the crossover; see [We Found the Crossover](/blog/we-found-the-crossover).)
