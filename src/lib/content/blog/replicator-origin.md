---
title: "Why We Moved Our Document Production into Web Code: The Origin of Replicator"
metaTitle: "Documents as Web Code | Origin of Replicator"
slug: replicator-origin
description: "CMSs frustrate everyone in one of two directions, and print design fails the same way with different symptoms. The origin story of Replicator: how an agency fired its design software, moved PDF production into SvelteKit, built an edit-in-place editor and versioned repository, and discovered the whole system already spoke the LLM's native language."
date: 2026-07-05
draft: false
tags: [ai, cms, design, pdf, architecture]
image: https://lj-01.nyc3.cdn.digitaloceanspaces.com/images/blog/owl.webp
imageDescription: A watercolor painting of a wide-eyed owl
author: Kevin Peckham
quote:
  text: "We looked at what we had already built and realized that because the whole system was rooted in web code, it already spoke the LLM's native language."
  attribution: Kevin Peckham, Principal at Lightning Jar
glossary:
  - term: CMS (Content Management System)
    definition: Software that lets non-developers publish and manage website content. The tension between protecting design integrity and giving editors freedom is the central CMS dilemma.
  - term: WYSIWYG
    definition: "\"What You See Is What You Get\": an editing interface that lets users style content freely, with little enforcement of structure, semantics, or design rules."
  - term: Edit-in-Place
    definition: An editing model where you change content by clicking directly into the rendered page, rather than through a separate form or admin screen.
  - term: Semantic HTML
    definition: Using HTML elements according to their meaning (headings, lists, navigation) rather than their appearance, which search engines and assistive technology depend on.
  - term: a11y (Accessibility)
    definition: The practice of making web content usable by people with disabilities. One of the first casualties of unconstrained WYSIWYG editing.
  - term: Design System
    definition: A managed set of reusable components, layouts, and rules that keeps every document and page a brand produces consistent.
additionalReading:
  - title: "HTML as a Native Data Format for LLMs"
    url: "/blog/ast-as-html"
  - title: "Content Is an Overlay: Separating Words from Structure in an AI Document Editor"
    url: "/blog/content-overlay"
  - title: "Migrating Away from WordPress"
    url: "/blog/migrating-away-from-wordpress"
---

I've written two posts about the engineering inside Replicator, our AI document platform: [how it encodes design templates as HTML so a model can author them](/blog/ast-as-html), and [how content lives in an overlay so nobody can break the layout](/blog/content-overlay). This post is the prequel: where the system came from, and why an agency that made its living on design software decided to stop using it.

The short version is that Replicator grew out of two problems that had been true for as long as I've run an agency:

1. CMS systems were a pain point for us and our customers.
2. Managing print designs was a pain point for us and our customers.

It took years to notice they were the same problem.

## The CMS Trap

On most website projects, the CMS is a client must-have that massively grows the project's scope and complexity, and then barely gets used. That's the good outcome.

For the clients who *do* publish and manage content regularly, the CMS becomes a constant point of friction, and it fails in one of two directions. Lock it down with constraints to protect the integrity of the page design, and the client spends their time asking for added features, workarounds, and one-time exceptions to the rules. Leave it open, a glorified WYSIWYG, and there are too few constraints: usability, accessibility, and design deteriorate until the page reads like a bad PowerPoint slide.

Neither failure is the content manager's fault. Client content managers are typically not designers or developers. They usually have, at best, a shallow understanding of semantic HTML, SEO, and accessibility, and there's no reason they should need one. The tool is what's supposed to know those things.

## Print Had the Same Disease

For years we also designed and produced PDF collateral for clients: brochures, flyers, sales handbooks, investor presentations. Based on the inherent capabilities and limitations of design software, managing the *content* in those documents was a nightmare.

Docs were filled with typos that were hard to catch. Layout errors crept in that were subtle to see and often caused by an errant drag and drop. And when the client wanted edits, the supplied text often didn't fit the existing design, so we'd pull a designer back in, break content across pages, revise templates, proof, and check. A lot of time-consuming work just to add or remove a paragraph.

Notice the shape of both problems: the content and the design live in the same document, edited with the same tool, by people with different jobs.

## The False Dawn of Edit-in-Place

When edit-in-place systems like Squarespace came along, we thought they might fit clients who liked making many small tweaks to their websites. They didn't, and for the same underlying reasons: little to no programmatic ability, templates that couldn't be locked down, content that wasn't centrally located. And the editing experience was still just complicated enough for many clients to break things on the way to publishing.

The idea was right. Clicking into the rendered page and typing is the correct editing experience. The architecture underneath it was what failed.

## Firing Our Design Software

A few years ago, these separate problems came together in my mind as the same problem, or at least a similar enough set of problems that one solution might address them all. The first thing we did was radical for a design shop: we moved all of our PDF production into web code and stopped using design software for documents entirely.

We built a homegrown system in SvelteKit that staged documents as components and routes, and we used the browser's built-in capabilities to generate the PDFs. Aside from spotty CSS support in some PDF engines, this was pretty straightforward, and it had a compounding benefit: my team got to focus on mastering CSS, a durable and transferable skill, instead of memorizing the features and menus of design software.

Most importantly, it let us abstract the content layer away from the design layer. Copy lived in JSON; layout lived in components. When a client needed a copy edit, we found the correct datum in the JSON file and made the edit in minutes, with no risk of breaking the layout. The designer never had to be pulled back in for a paragraph.

## Letting Clients In

That was a big step forward, but it still wasn't a way for clients to edit their own documents. We were still the bottleneck; the JSON was ours.

So we started building an edit-in-place document editor in SvelteKit, and that engine became a core component of the Replicator system. Now a client could be sent a web link, click into the content on the rendered page, edit it, and generate a variation of their flyer, with the design locked safely out of reach.

Two lessons surfaced almost immediately:

1. **The editor wasn't very valuable without a version-controlled repository behind it.** An editable document you can't version, share, and publish is a demo, not a tool.
2. **Editing web pages could be approached in exactly the same fashion.** The thing we'd built for flyers was not actually about flyers.

So we built a repository engine for versioned, editable documents and web components, with published, versioned PDF outputs. And once components started being shared across documents, the lines blurred into something bigger than a document tool: a design system builder and manager.

## The Spark

Around this time came the advent of genuinely capable LLMs. A client, SecureLogix, came to us asking how they could incorporate LLMs to generate and edit marketing collateral faster.

We looked at what we had already built. Because the whole system was rooted in web code, it already spoke the LLM's native language: the templates were HTML, the content was addressed data, the constraints were declared in the tree. We didn't need to build a bridge between an AI and a proprietary document format, because we had spent years, without knowing it, removing the proprietary document format.

That was the spark for Replicator. What happened next, teaching an agent to author templates and draft copy inside the same rails as everyone else, is the story the [other](/blog/ast-as-html) [two](/blog/content-overlay) posts tell.

The lesson I take from the long arc: we didn't set out to build an AI product. We set out to separate content from design so that neither could hurt the other, and it turned out that the same separation that protects a marketing manager from breaking a layout is what makes a document platform legible to a language model. Solve the human problem well enough and sometimes the machine problem comes free.
