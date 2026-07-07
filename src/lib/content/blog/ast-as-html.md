---
title: "HTML as a Native Data Format for LLMs: Why We Encode Our Data in Markup Instead of JSON"
metaTitle: "HTML as a Native Data Format for LLMs | AST-as-HTML"
slug: ast-as-html
description: "LLMs have deep, pre-trained fluency in HTML. So when the AI assistant in our document platform reads and writes template layouts, we encode the tree as markup instead of JSON. Here's why a format the model already speaks beat a granular JSON tool API, and the scars we picked up along the way."
date: 2026-07-04
draft: false
tags: [ai, agents, llm, html, architecture]
image: https://lj-01.nyc3.cdn.digitaloceanspaces.com/images/blog/tree-01.webp
imageDescription: A watercolor painting of a tree
author: Kevin Peckham
quote:
  text: "Ask a model for an inventory of a JSON tree and it reconstructs; ask for an inventory of an HTML tree and it reads the labels."
  attribution: Kevin Peckham, Principal at Lightning Jar
glossary:
  - term: AST (Abstract Syntax Tree)
    definition: A tree representation of a document's structure. In our system a template is an AST of pages, blocks, and atoms, stored as typed JSON and authored as HTML.
  - term: Atom
    definition: "The smallest content node in a template: a text atom, image atom, or styled container atom. Atoms are the leaves of the template tree."
  - term: Widget
    definition: A reusable, self-contained layout unit that a template references through a slot. Widgets are authored in the same markup as templates and validated by the same parser.
  - term: Slot
    definition: A node in a template that references a reusable widget rather than hardcoding its contents, allowing shared layouts to be composed and swapped.
  - term: Theme Token
    definition: A named design value (like bg-primary) resolved at render time by the active brand theme via CSS variables, so a template never hardcodes a color or scale.
  - term: nanoid
    definition: A compact, URL-safe unique identifier. Our system generates 21-character nanoids for template nodes; content is matched to nodes by these ids.
  - term: Round-trip property test
    definition: A test asserting that parsing then re-serializing a structure, parse(build(tree)), preserves it exactly, including ids, names, and attributes.
additionalReading:
  - title: "We Benchmarked It: What Held Up in 'HTML as a Native Data Format for LLMs', and What Didn't"
    url: "/blog/barkup-bench-results"
  - title: "A Deprecated Accessor That Still Typechecks Broke My Benchmark (and Maybe Your Agent)"
    url: "/blog/tool-history-footgun"
  - title: "We Found the Crossover (It Wasn't Where Anyone Looked)"
    url: "/blog/we-found-the-crossover"
  - title: "Content Is an Overlay: Separating Words from Structure in an AI Document Editor"
    url: "/blog/content-overlay"
  - title: "Why We Moved Our Document Production into Web Code: The Origin of Replicator"
    url: "/blog/replicator-origin"
  - title: "Questions, Decisions & Compromises"
    url: "/blog/questions-decisions-compromises"
  - title: "Why SvelteKit is the Best Choice for Modern B2B Websites"
    url: "/blog/sveltekit-vs-wordpress-b2b"
  - title: "Please Don't Force Links to Open in New Tabs"
    url: "/blog/why-links-should-not-open-in-new-tabs"
---

***Update (July 2026):*** *After publishing this, we put its claims to a pre-registered benchmark, and not all of them held up: the whole-tree rewrite strategy won clearly, but the HTML dialect itself proved accuracy-neutral rather than the edge this piece assumed. The original argument stands below as written, with the specifics corrected inline and in the update section near the end. Full results: [We Benchmarked It](/blog/barkup-bench-results).*

***Correction (July 6, 2026):*** *A harness defect was then found in the benchmark itself: our tools loop hid the models' own tool calls from multi-turn conversation history. With that fixed, the whole-tree rewrite strategy's accuracy win also disappears: no interface dominates. The cost findings and the format results stand. So the case this article makes now rests on whole-tree rewrite's structural immunity to exactly that class of tool-history loss, on its token economy, and on the codec's guarantees, not on model fluency or on granular tools being unreliable. Details in the update section near the end of this article and in the corrected companion post, [We Benchmarked It](/blog/barkup-bench-results).*

We built a document platform where an AI assistant designs marketing documents (flyers, brochures, one-pagers) inside brand-approved rails, and humans finish them by clicking into the rendered page and typing. Getting the agent to *author templates*, the structural layouts those documents are built from, turned out to hinge on a single unfashionable decision:

**We encode our templates as HTML, not JSON. And the agent's main editing tool is "rewrite the whole thing."**

That inverts most of the current advice about building agents on structured data. It also turned out to be the cheaper, sturdier choice: fewer tokens burned, faster responses, and better data integrity on every edit. This post is about why.

## The Problem

A document template in our system is a tree: a document contains pages, pages contain blocks, blocks contain text atoms, image atoms, styled containers, and *slots* that reference reusable widgets. Every node carries attributes: CSS classes, length budgets for copy, type-scale choices, slot constraints. Themes paint the tree through CSS variables, so a template never hardcodes a color; it says `bg-primary` and the active brand theme decides what that means.

We wanted an assistant that could build and restructure these trees conversationally: *"Design a full-width widget with a rounded content box on the left and a stat panel on the right."* And we wanted its output to land in the same editor, with the same undo semantics and the same validation, as a human's edits.

## The Obvious Design, and Why We Didn't Ship It

The textbook approach is to store the tree as JSON and give the model a granular tool API:

```
insertNode(parentId, type, index)
setAttribute(nodeId, key, value)
moveNode(nodeId, newParentId, index)
removeNode(nodeId)
```

We've built agents like this. They work, but they under-perform in three predictable ways:

1. **You're teaching a bespoke schema from scratch.** Every node type, every attribute, every containment rule has to be spelled out in the prompt, and the model's only fluency is whatever your prompt bought. It has seen your JSON schema zero times in training.
2. **Granular tools invite granular failure.** Building a twelve-node layout takes a dozen round trips. Each call can reference a stale id, a wrong parent, an index that shifted two calls ago. The tree passes through eleven intermediate states, each a chance to strand the agent somewhere invalid, and each a state your renderer might have to survive. (*Update, July 2026: ~~measured at +33 points for rewrite on multi-turn reference edits, though the mechanism was models failing to execute follow-up tool calls, not stale references.~~ Correction, July 2026: that +33-point gap was our own benchmark harness hiding the model's tool calls from the conversation history. With correct history, rewrite vs tools on multi-turn reference edits is 88.1% vs 91.3% (no significant difference) and no arm ever produced a stale-reference failure.*)
3. **The model can't "see" its work.** With mutation-by-tool-call, the model's picture of the current tree is a mental reconstruction from its own call history. Drift is inevitable.

## The Inversion

Our templates serialize to plain HTML with a small attribute grammar:

```html
<div data-type="block" data-name="feature-callout" id="wgt-root">
  <div data-type="container-atom" data-name="content-box" id="wgt-content"
       data-container-classes="rounded-2xl flex-[2] bg-primary p-6">
    <div data-type="text-atom" data-name="heading" id="wgt-heading"
         data-text-element-tag="h2" data-text-style="heading-2"
         data-max-length="60"></div>
  </div>
</div>
```

Every node is an element. `data-type` names the node kind, `data-name` is a stable human label, `data-*` carries attributes, and a parser converts this to and from the internal AST. This predates our agent work; it existed so templates could round-trip through a human-editable markup view.

When we built the template-authoring agent, we made its primary tool embarrassingly blunt:

```
set_template_markup(markup: string, summary: string)
// "Replace the ENTIRE template with new markup."
```

That's it. The model reads the current markup (sent fresh with every request, so it always edits what the user actually sees), writes the complete new tree, and the client validates and applies it in one shot.

The result surprised us with how little prompting it needed. LLMs have deep, pre-trained fluency in HTML: nesting, attributes, class strings, ids. We didn't teach a format; we borrowed one the model already speaks natively. The prompt spends its budget on our *semantics* (what a widget-slot means, which theme tokens exist, how length budgets work) instead of on syntax. A grammar digest generated from the same config file the visual editor uses keeps the two from drifting.

And because each edit is a whole tree, there are no intermediate states. The edit is coherent or it's rejected, one parse at the boundary:

```ts
const parsed = parseMarkupToAst(markup);
if (parsed?.type !== "block") reject("widgets need a single block root");
editor.markupCurrent = format(build(parsed)); // same funnel as human edits
```

Every agent edit flows through the exact pipeline every human edit uses. Same validation, same undo, same reactive preview. The agent isn't a privileged actor with its own write path; it's just another author.

## Closed Containers in the Attic

Working with JSON is like hunting through closed storage containers in an attic. The labels are inside the lid; you have to open each container to learn what it is, and because JSON nests, you're opening containers inside containers inside containers. The containers only make sense if you brought the packing list: without knowing the key names and schema in advance, you can't even ask the right questions. And when you're done rummaging, the way out is a run of identical unlabeled lids (`}]}}`), none of which says what it closes. Deep in the attic, one misplaced lid and the whole stack is corrupt.

***HTML labels the outside of every container:***

```html
<div data-type="text-atom" data-name="heading" data-max-length="60">
```

The node's type, name, and constraints are readable before you ever step inside, and the container closes with its name on it. Ask a model for an inventory of a JSON tree and it *reconstructs*; ask for an inventory of an HTML tree and it *reads the labels*. (*Update, July 2026: this one didn't survive the benchmark; measured reading accuracy tied across formats, 87.1% vs 87.9%.*) That difference is most of why the whole-tree tool works: generating sixty nodes of labeled, self-closing HTML containers is something the model has done a billion times, and getting the lids right is easy when every lid says what it belongs to.

The irony is that we always planned to hand this tree to an LLM, but our early prototypes didn't yet; templates had to be authored and debugged by hand, so the problem we were solving first was *human* parsability. Labels on the outside made the tree easier for a person to read and write. That choice ended up revealing a hidden truth about LLM readability: legibility for the human author and fluency for the model are the same property.

(Hold that thought about the attic, though; it comes back. An attic is a perfectly good place to *store* things. You just don't want to *work* in one.)

### The Payoff Is Practical, Not Just Aesthetic

- **Fewer tokens burned.** The prompt no longer has to teach a schema the model already knows. (*Update, July 2026: 4 to 5× fewer tokens than mutation tools on small and medium trees; about 30% cheaper than JSON rewrite on large trees; id-anchored patches beat everything at 13.2k tokens per solved 150-node task.*)
- **Fewer round trips.** A model this fluent can author the whole tree in one pass instead of assembling it mutation by mutation.
- **More reliable transfer.** A slipped tag fails loudly at the parser instead of silently corrupting everything after it.
- **Faster reads.** The model scans labels instead of reconstructing structure.
- **Better integrity on every parse-and-rebuild cycle.** A tree whose nodes announce themselves is a tree you can verify at a glance.

## The Escape Hatch

Full-tree rewrites are wasteful for one-attribute tweaks, and rewriting sixty nodes to change one class invites transcription drift in the other fifty-nine. So there's exactly one surgical tool:

```
set_node_attributes(nodeId: string, attributes: Record<string, value>)
```

The tool cost almost nothing to build, and that's worth pausing on. In a web application, the machinery for editing HTML surgically already ships with the browser: `getElementById`, `setAttribute`, `querySelector`. These APIs are fast, battle-tested, and documented to a depth no in-house tree-mutation library will ever match. We didn't have to invent a node-addressing scheme or write an attribute patcher; the platform had already spent decades perfecting them.

Two tools total for structural editing. In practice the model picks correctly without guidance: big changes get a rewrite, tweaks get a patch. Compare that with the tool-catalog approach, where the model must choose among a dozen mutations and compose them correctly.

The same grammar then paid a second dividend: when we later let the *document* assistant mint brand-new widgets mid-conversation, it authored them in the same markup, validated by the same parser, with no new format to teach.

## The Scar Tissue

This is the part most posts skip. Three real bugs, all instructive:

**1. Ids are sacred, and our formatter wasn't treating them that way.** Content in our system is matched to template nodes by id, and the agent references nodes by the ids *it authored* ("wgt-wrapper"). Our HTML formatter had an old rule: regenerate any id shorter than 21 characters (the length of our generated nanoids). So the agent's readable ids were silently rewritten to random strings on the first format pass, and its follow-up `set_node_attributes("wgt-wrapper", …)` failed with *"No node with id."* A user hit this in the first real session. The fix was one line (only generate an id when one is *missing*), but the lesson generalizes: **if agents reference identifiers, every pass in your pipeline must preserve them byte-for-byte.** Normalization steps written for humans will betray you.

**2. HTML attributes are stringly typed; your AST probably isn't.** Our parser coerces `"true"` → `true` and `"1.5"` → `1.5` on read. Useful for humans, hazardous in general: a version string like `"1.5"` becomes the number 1.5, and a text attribute that happens to look numeric gets type-bent on every round trip. We maintain an opt-out list of string-only attributes, which means every new attribute is a latent bug until someone remembers the list. If we started over, coercion would be per-attribute and declared in the node config, not inferred. (The reference implementation at the end of this article does exactly that.)

**3. Markup is the interchange format, not the storage format.** Our blobs actually store the parsed AST as JSON (the attic, remember, is a fine place to keep things). Machines fetching sealed containers by address don't care that the labels are inside; only *authors* do. Markup exists at exactly two boundaries: the human markup editor and the agent's tool I/O. Those are the two places where someone is actually rummaging. This matters more than it sounds: our servers have no DOMParser, so *all* markup→AST conversion happens client-side at those boundaries, and everything downstream (slot resolution, rendering, content matching) works on typed JSON. "AST-as-HTML" really means *HTML as the authoring dialect of the AST*, with one guarded door between them. Blur that line and you'll end up parsing HTML in places that can't.

One more discipline that earns its keep: **round-trip property tests.** `parse(build(tree))` must preserve ids, names, and attributes exactly. The formatter bug above would have been caught by a five-line test we only wrote afterward.

## When You Shouldn't Do This

- **Deeply typed or numeric-heavy trees.** If your nodes are mostly floats, enums, and cross-references, HTML's stringly attributes fight you. This works because document layout is *already* HTML-shaped.
- **Huge documents.** Full-tree rewrites scale with tree size. Ours are bounded (a template is a few dozen nodes); a 10,000-node scene graph would need the granular API after all, or chunked rewrites. (*Update, July 2026: now measured. Above about 300 nodes, whole-markup rewrite becomes frontier-model-only and slow (minutes per edit), and id-anchored patches, which held 87 to 100% at every size tested, are the measured alternative.*)
- **Trees the model shouldn't fully see.** Whole-tree I/O assumes the whole tree fits in context and is safe to show.
- **Multi-writer concurrency.** "Replace everything" is last-write-wins by construction. Fine for one user plus one assistant in a session; wrong for real-time collaboration.

## Isn't This Just XML?

Structurally, yes: an HTML dialect built from `data-*` attributes is more or less XML with a fixed vocabulary, and anyone who lived through the SOAP era has earned their suspicion. But the argument was never about angle brackets. It's about two things XML doesn't give you.

**Training distribution.** Models have seen orders of magnitude more HTML than XML: billions of pages of it, in every style, next to every kind of surrounding context. The idioms our dialect leans on (`data-*` attributes, class strings, id discipline, labeled closing structure) are HTML-native patterns the model has produced constantly since pretraining. Generic XML fluency exists, but it's thinner, more formal, and further from how our trees actually read.

**Platform machinery.** Every browser ships a battle-tested parser, serializer, and query engine for HTML: `DOMParser`, `querySelector`, `setAttribute`. Our surgical tool cost almost nothing to build because the platform had spent decades building it for us. Choosing XML would buy the same syntax with weaker model fluency and none of that free tooling at the authoring boundary.

And in our domain the choice isn't even a metaphor: document layout is *already* HTML-shaped, and the dialect describes things that will eventually render as HTML anyway. If your tree is a financial ledger, the calculus may differ. Ours is a page.

## A Note on Evidence

Everything in this post is production experience: real bugs, real user sessions, and zero controlled experiments. Claims like "it needed less prompting" and "transcription drift went away" are honest observations, but they are anecdotes, not measurements.

We're putting the finishing touches on a series of benchmark tests designed to prove (or disprove) the hypotheses in this article: that encoding trees as HTML instead of JSON buys fewer tokens, fewer round trips, and more reliable edits. We'll share the findings either way, good or bad, and we'll open-source the benchmark itself so the tests are repeatable on your models and your trees. If these claims don't survive measurement, you'll read about that here too.

## Update (July 2026): The Benchmark Results Are In

We ran the benchmark we promised: pre-registered, six conditions (HTML vs an equal-strictness JSON twin, whole-tree rewrite vs granular mutation tools vs JSON Patch vs id-anchored patches), four models from three vendors, 9,600 scored runs, every prompt and seed committed before the first scored call. Full report and code: [barkup-bench](https://github.com/kevinpeckham/barkup-bench).

![Line chart: task success rate versus tree size for six conditions, protocol v2. No interface dominates; whole-tree rewrite, granular tools, and id-anchored patches land within a few points at every size, while positional RFC 6902 JSON Patch is the outlier at scale, dropping to 69.6% at about 150 nodes.](/blog/img/crossover-success-light.svg)

*Task success by tree size, pooled over four models with parity prompts, protocol v2 (corrected tool history); whiskers are Wilson 95% intervals.*

What held up: ~~**whole-tree rewrite beat granular mutation tools**, by +5.3 points overall (p < 0.0001) and +33 points on multi-turn tasks where the agent edits a node it created earlier. The failures were not stale ids; smaller models simply failed to execute follow-up edits in multi-turn tool conversations. The predicted "tools win on big trees" crossover never appeared up to \~190 nodes.~~ (*Correction, July 2026: those gaps were an artifact of a defect in our benchmark harness: see the correction at the end of this section. With correct tool history, rewrite vs tools is 91.9% vs 93.9% overall and −3.1 points on the multi-turn tasks, not significant. What follows in this paragraph stands.*) JSON Patch collapsed to 69.6% success on large trees. A pre-registered follow-up confirmed the diagnosis: patches that address nodes by id instead of positional paths recovered the entire collapse (85.1% at ~150 nodes), matched whole-tree rewrite's success rate (92.6% vs 91.9%, p = 0.53), and were the cheapest condition measured. And rewrite solved small and medium tasks with 4 to 5× fewer tokens than tools.

![Dot plot: multi-turn reference-edit success for four models across six conditions, protocol v2. Every interface is near parity within each model; positional JSON Patch is the weakest and id-anchored patches stay high.](/blog/img/reference-stability-light.svg)

*Multi-turn reference edits by model and condition, protocol v2 (corrected tool history): near parity across interfaces, with zero stale-id failures in any arm.*

What didn't: **the HTML dialect itself was accuracy-neutral.** Against a JSON twin with identical validator strictness and error quality, HTML and JSON tied on first-pass validity (≥99% everywhere; modern models write both formats essentially perfectly), tied on editing success, and tied on reading accuracy. The one place the format measurably mattered was cost: HTML's terser encoding was about 30% cheaper than JSON per solved large-tree task.

So the honest, post-data version of this article's thesis: the *strategy* (whole-artifact rewrite over a validating codec) is what makes agent editing robust, at the tree sizes we first tested. The HTML dialect costs nothing on accuracy, saves tokens at scale, and keeps its unmeasured, decisive advantage: the same artifact stays legible to the humans who review, diff, and debug it. We'd still choose it. We'd just sell it differently, and now we can say why with numbers. Longer write-up: [We Benchmarked It](/blog/barkup-bench-results).

***Correction (July 6, 2026):*** *Shortly after publishing this update we found a defect in the benchmark harness itself, and the strategy win reported above did not survive it. Our tools loop built multi-turn history from the AI SDK's `response.messages`, which silently omits tool-call and tool-result messages, so in every multi-turn tools conversation the model could not see its own prior tool activity, including the insert that returned the id it was asked to edit. Re-running the affected cells with correct history ("protocol v2") erased the gaps: rewrite vs granular tools is 91.9% vs 93.9% overall (a slight tools edge, p = 0.04); the +33-point multi-turn gap becomes −3.1 points, not significant (88.1% vs 91.3%); and the small-model tools fragility disappears (haiku-4.5: 80.5% → 95.0% with tools; gemini-3.5-flash: 75.5% → 88.5%). What stands: every token-cost finding (including rewrite's 4-to-5× advantage over tools on small and medium trees and HTML's ~30% savings over JSON at scale), the format null results, JSON Patch's collapse at ~150 nodes (69.6%), and all of the id-anchored-patch results. The durable lesson is the defect itself: with its own tool calls hidden from history, gemini-3.5-flash completed 3.8% of multi-turn reference edits and haiku-4.5 28.8%; with correct history, 71.2% and 98.8%, while the frontier models barely moved, masking the bug. So the post-data thesis needs one more revision: whole-artifact rewrite is not measurably more accurate than granular tools; it is structurally immune to the class of history-construction mistake we made, which is a different (and, we think, still decisive) kind of robustness. Full correction and corrected figures: [We Benchmarked It](/blog/barkup-bench-results).*

***Update (July 2026):*** *One later pre-registered result partially rehabilitates the fluency claim at a different boundary: when the model reads a focused HTML view of the tree instead of a full serialization, the HTML rendering is 9 to 24% terser than an equal-content JSON twin at identical accuracy, with a small (exploratory) edge in first-pass patch validity; details in [We Benchmarked It](/blog/barkup-bench-results).*

***Update (July 2026):*** *One more twist: a pre-registered size extension found the crossover this article originally predicted, just not between rewrite and granular tools. At 300 to 1000 nodes, whole-tree rewrite becomes a frontier-only technique (gemini-3.5-flash solved 0 of 15 tasks at about 1000 nodes; claude-sonnet-4.5 solved 12 of 15, and only over a streaming transport), while id-anchored patches held 87 to 100% for both models at every size, at a fraction of the cost. So the "one coherent edit" advice below stands for trees up to about 200 nodes; above about 300, anchor the edit to stable ids instead. Details: [We Found the Crossover](/blog/we-found-the-crossover).*

## Takeaways

1. **Choose formats the model already speaks.** Fluency you don't have to prompt for is the cheapest capability you will ever ship, and it's the same property as human legibility: design for the person reading by hand and the model benefits for free.
2. **Prefer one coherent edit over many granular ones.** Whole-artifact rewrites eliminate intermediate invalid states and the stale-reference bugs that plague mutation APIs. Add one surgical tool, not twelve.
3. **Validate at the boundary, then reuse the human pipeline.** The agent should be an ordinary author flowing through the same funnel as everyone else, not a privileged actor with a private write path.
4. **Treat identifiers as a contract.** Anything the agent can reference later must survive every formatter, normalizer, and round trip unchanged.
5. **Keep the friendly format at the edges.** Store typed data in the attic; expose the ergonomic dialect only where humans and models actually author.

The unfashionable summary: we got a better agent by giving it *less* API and *more* HTML.

## A Reference Implementation: barkup

The pattern in this article now has a reference implementation: [barkup](https://github.com/kevinpeckham/barkup), published on npm as [`@kevinpeckham/barkup`](https://www.npmjs.com/package/@kevinpeckham/barkup) (MIT). The name is the thesis: bark is how a tree shows you what it is without being cut open.

You declare a grammar (node types, allowed children, typed attributes) and get `build`, `parse`, `format`, and `validate` with the guarantees this article argues for baked in:

- **Ids are a contract.** Ids survive parse, build, and format byte-for-byte; `format()` fills in only *missing* ids and never touches an existing one. That is scar number one, fixed at the library level.
- **Declared coercion only.** An attribute's type comes from its grammar declaration, never from the shape of its value, so `"1.5"` stays a string unless you declared the attribute a number. That is scar number two, fixed the way we said we would fix it.
- **Round-trip identity.** `parse(build(tree))` deep-equals the normalized tree: ids, names, types, attributes, order. A testing entry point ships property-test helpers so you can prove the same guarantee over *your* grammar.
- **Loud boundaries.** Invalid markup returns structured issues naming the node, attribute, and path, never a silently repaired tree. Hand the issues back to the model verbatim and it fixes its own markup.

The core has zero runtime dependencies. It uses the platform `DOMParser` in the browser and accepts an adapter for runtimes without one, which keeps the guarded door between markup and typed JSON exactly where this article left it.

And it is not an extraction for show: the document platform this article describes now runs on barkup. The template grammar is declared through the library, and the same codec that validates the agent's markup enforces the guarantees above in production. The scars are why the guarantees exist; dogfooding is how we know they hold.

## Credits

Thanks to David Heard of [SecureLogix](https://www.securelogix.com), who set us on the path to building the marketing tools that led to this discovery.
