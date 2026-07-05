---
title: "Content Is an Overlay (and Ids Are Its Registration Pegs)"
metaTitle: "Content Is an Overlay | Registration Pegs"
slug: content-overlay
description: "A template gets designed once and used for many documents, so the person typing a headline must never be editing the template. Our answer borrows from classic animation: content lives in a flat overlay of particles that register onto stable node ids like cels dropping onto pegs. Humans and the AI assistant edit through the same path, and neither can break the layout."
date: 2026-07-05
draft: false
tags: [ai, agents, llm, architecture, cms]
image: https://lj-01.nyc3.cdn.digitaloceanspaces.com/images/blog/writing.webp
imageDescription: A vintage illustration of a girl writing at a wooden desk
author: Kevin Peckham
quote:
  text: "We got safer documents by giving editors less access and better addresses. The background painting stays on the table. Everyone else just drops cels on the pegs."
  attribution: Kevin Peckham, Principal at Lightning Jar
glossary:
  - term: Cel
    definition: "In classic animation, a transparent celluloid sheet painted with a character and layered over a reusable background. In our system: a content particle holding one atom's authored content, layered over the template."
  - term: Registration Pegs
    definition: The pegs at the edge of an animation table that align every punched layer. In our system, the stable node ids that content particles register to.
  - term: Content Particle
    definition: A flat record storing one atom's authored content (text or image) plus its address, the node id and slot instance id it registers to.
  - term: Slot Instance Id
    definition: The id of the slot node a widget was resolved into, stamped down the widget's subtree at composition time so repeated widgets get distinct content addresses.
  - term: Dummy Layer
    definition: Placeholder content generated directly from the template's length budgets, so a document previews at realistic density before anything is authored.
  - term: Composed Tree
    definition: The template tree after slot resolution, with each slot placeholder replaced by its widget's actual subtree.
  - term: CRDT (Conflict-free Replicated Data Type)
    definition: A data structure designed for real-time collaborative editing where concurrent edits merge without conflicts. The overlay deliberately is not one.
additionalReading:
  - title: "HTML as a Native Data Format for LLMs"
    url: "/blog/ast-as-html"
  - title: "Questions, Decisions & Compromises"
    url: "/blog/questions-decisions-compromises"
  - title: "Why SvelteKit is the Best Choice for Modern B2B Websites"
    url: "/blog/sveltekit-vs-wordpress-b2b"
---

In the [last post](/blog/ast-as-html) I described how our document platform encodes design templates as HTML so that an AI assistant can author them fluently. That post ended with the templates. This one is about the other half of the system: the *words*. A template gets designed once and used to make many documents, and the person typing a headline onto a rendered flyer must never, ever be editing the template.

Here's the experience we wanted: you open a document, you see the finished design, you click into a headline *on the rendered page* and type. An AI assistant drafts the copy for the whole document, and you watch the words stream into the layout. The template underneath stays shared: when a designer improves it, every document picks up the improvement. Nothing forks.

The mechanism that makes this work is old animation technology.

## Cels and Pegs

Classic animation studios painted the background once (the room, the furniture, the light) and painted the characters on transparent celluloid sheets layered on top. The background was expensive and reused across hundreds of frames; the cels changed constantly and cheaply. And the whole system depended on one humble piece of hardware: the **registration pegs** at the edge of the table. Every layer was punched with the same holes. Drop the cel on the pegs and it lands exactly where it belongs, every time, no matter who painted it or when.

That's our content system. The template is the background painting. The content is a stack of cels. And the node ids, the same human-readable ids the agent authors in markup, are the registration pegs.

## The Obvious Designs, and Why We Didn't Ship Them

**Clone-on-instantiate.** Copy the template's tree into each new document and let edits mutate the copy. Every CMS demo does this, and it quietly destroys the thing templates are for: the moment you clone, template improvements stop propagating, a thousand documents each own a divergent snapshot of the design, and the person "just fixing a typo" is one errant keystroke away from restructuring the layout. Worse for us: an agent editing copy inside a cloned tree can edit *structure* by accident, because copy and structure live in the same document.

**Schema-first.** Derive a form schema from the template, store content against the schema, render by merging. This is the respectable headless-CMS answer, and it doubles your data model: the schema is a second tree that must be regenerated, versioned, and migrated every time the design changes. Our template *is* the schema. It already declares every text slot, its length budget, its style. Deriving a parallel schema from a tree we already have is a synchronization bug with extra steps.

## The Overlay

So we don't copy the tree and we don't derive a schema. A document stores two things: a **reference to its template version**, and a flat list of **content particles**, one per text or image atom:

```jsonc
{
  "id": "wgt-heading",           // the atom's node id: the peg
  "slotInstanceId": "slot-left", // which peg bar; more on this below
  "type": "text-atom",
  "textContent": "Q3 Threat Briefing",
  "maxLength": 60
}
```

That's a cel: a small transparent sheet holding one atom's worth of content, punched with the id of the node it registers to. The particle list is the whole document, as far as the document is concerned. The template tree is never modified, never copied, never even *seen* by the save path.

Beneath the authored cels sits a **dummy layer**. When a document is created (or a new atom appears in the template), placeholder content is generated straight from the tree; the template's length budgets drive it, so lorem text fills to about 95% of each atom's `maxLength` and the layout previews at realistic density. Authored content replaces dummy content *per atom*: load a document and each rendered atom takes its stored particle if one registers, dummy otherwise. There is no merge ceremony; a cel either sits on the pegs or it doesn't.

Editing in place falls out almost for free. Every rendered text atom is its own little `contenteditable` region, bound directly to its matched particle: keystrokes flow into the overlay, paste is sanitized to plain text, blur normalizes whitespace, and the length budget pushes back as you type. Images are the same story with a picker: hover an image atom, choose a replacement, and the swap writes to the particle registered at that address. The person typing is physically incapable of restructuring the document, because the surface they're editing doesn't contain the structure.

## The Instance Problem

Registration by id has a hole in it, and it's exactly the hole reusable components create: put the same widget in two slots and every node id in that widget now appears **twice** in the composed document. Two headlines, one peg. Whichever particle registers first wins both, and the copy you wrote for the left column shows up in the right one.

The fix is a second peg. When the composition step resolves a slot (swaps the placeholder for the widget's actual subtree), it stamps the resolved root with a `slotInstanceId`: the id of the *slot node itself*, which is unique in the document even when the widget isn't. The stamp inherits down the subtree, every particle carries it, and content addressing becomes a two-part key:

```
slot-left::wgt-heading     // the widget's headline, left slot
slot-right::wgt-heading    // the same widget's headline, right slot
```

An atom that isn't inside any slot just uses its bare id. The rule is easy to say out loud: **the id names the atom; the slot instance names the placement.** Between them, every piece of content in a document built from arbitrarily nested, arbitrarily repeated components has exactly one address.

## The Agent Is Just Another Author, Again

The last post argued that an agent should flow through the same funnel as a human editor, not get a privileged write path. The content overlay is where that principle pays off a second time.

When the assistant drafts copy, the tool call it makes is almost insultingly simple, a list of cels:

```jsonc
{ "items": [
  { "id": "wgt-heading", "slotInstanceId": "slot-left",
    "textContent": "Q3 Threat Briefing" },
  { "id": "wgt-body", "slotInstanceId": "slot-left",
    "textContent": "Three attack patterns dominated the quarter…" }
]}
```

The agent receives the document's particles (ids, slot instances, length budgets, descriptions) as its prompt context, and it **echoes the addresses back verbatim** with new text. Client-side, each item routes through the exact same update method a keystroke uses. Same matcher, same two-part key, same reactive binding into the rendered page, which is why the words visibly stream into the layout while the model writes. There is no "agent document format." There are only cels, and everyone (the dummy generator, the human's contenteditable, the model's tool call) drops them on the same pegs.

The failure mode this design prevented is worth naming: our first version of the agent tool did *not* carry `slotInstanceId`, and every atom inside a slot came back blank: the model wrote perfectly good copy to addresses that didn't resolve. The fix wasn't a smarter matcher. It was requiring the tool schema to echo both halves of the address. Agents don't need clever recovery; they need complete addresses.

## The Scar Tissue

**1. Misregistration is real, and it looks like missing content.** The composed tree (slots resolved, widgets inlined) and the original tree (slot placeholders intact) are both necessary, and they are not interchangeable. The slot wrappers are what carry the instance stamp; the composed tree is what knows the final atoms. We once generated content addresses from one tree and rendered from the other, and every atom inside a widget rendered blank: cels punched against a peg bar that wasn't the one on the camera stand. The rule we extracted: **address and render through trees that share their wrappers.** Generate particles from the composed tree; render the original and forward the stamps down. Any time those two disagree, the symptom is silence, not an error.

**2. The pegs are only as good as their preservation.** The formatter bug from the last post (readable ids silently regenerated to random strings) had its real blast radius *here*. Regenerate an id and you haven't just renamed a node; you've orphaned every cel punched with it. This is why "ids survive byte-for-byte" is the first guarantee in [barkup](https://github.com/kevinpeckham/barkup), the codec we extracted from this system: the content overlay is the downstream consumer that contract exists for. (We also keep a fallback matcher, keyed on atom name, block name, page index, and slot instance, so legacy documents written before id-keying still register. Fallbacks age; contracts don't.)

**3. Duplicate the walker, duplicate the bugs.** Dummy generation, prompt generation, and rendering all walk the same tree and all need the same stamp-inheritance rule ("nearest enclosing slot stamp wins"). For a while we had three hand-rolled walkers, and their subtle disagreements produced the misregistration class above. They're one shared walker now. If a rule has to hold in three places, it should exist in one.

## When You Shouldn't Do This

- **Long-form flowing text.** The overlay addresses *bounded slots*: a headline, a stat, a paragraph with a budget. It has no cross-atom selections, no marks model, no splitting a paragraph into two. A prose editor wants ProseMirror-shaped machinery, not cels.
- **Real-time multi-writer editing.** Per-atom last-write-wins is fine for one human plus one assistant in a session; it is not a CRDT.
- **Content that must outlive its template.** If templates are regenerated wholesale with fresh ids, registration breaks and the tuple fallback only stretches so far. The system assumes template identity is continuous.

## Takeaways

1. **Content is data addressed *into* structure, not markup stored inside it.** The moment copy and structure share a document, one class of author can corrupt the other's work. Separate them and the person typing can't break the layout even on purpose.
2. **Ids are a contract with two parties.** Human legibility and model fluency were the last post's payoff; stable addressing is this one's. The same property serves both, which is strong evidence it's the right property.
3. **Name the placement, not just the node.** Reuse makes ids ambiguous by design. Stamp instances at composition time and make every address two parts: the fix is boring and permanent.
4. **Route the agent through the human's update path.** Echoed addresses plus a shared matcher meant streaming AI copy into a live preview cost us almost nothing. The funnel keeps paying.
5. **When content goes missing, check registration first.** Divergent trees, regenerated ids, missing stamps: every one of our worst content bugs was a misregistration wearing a different costume.

The last post's summary was that we got a better agent by giving it less API and more HTML. This one's is the mirror image: we got safer documents by giving editors *less access* and better *addresses*. The background painting stays on the table. Everyone else just drops cels on the pegs.
