---
title: SEO In The Age of LLMs: What’s Changing, What Still Matters, and How To Adapt
metaTitle: SEO Is Changing
slug: seo-is-changing
description: This article looks at the reasons why Lightning Jar is leaving the WordPress platform.
date: 2026-01-03
draft: true
tags: [wordpress, sveltekit, serverless]
image: https://lj-01.nyc3.cdn.digitaloceanspaces.com/images/search-01.webp
imageDescription: hands holding spectacles against a digital screen
author: Kevin Peckham
---

The search landscape is undergoing the biggest shift since “10 blue links.” Large language models (LLMs) are changing how people discover, evaluate, and act on information, often without ever visiting a website. If your growth strategy still assumes a Google-first world, you’re leaving attention, conversions, and money on the table. Here’s what’s changing, what still matters, and how to future‑proof your content and measurement.

## Google Search Was Already Broken

* Incentives have long favored ad load, affiliate-heavy content, and formats that optimize for crawlers—not humans.  
* SERPs increasingly keep users inside Google with answer boxes, knowledge panels, and AI Overviews.  
* The rise of programmatic “SEO content farms” flooded the web with derivative copy, making it harder for high-quality pages to surface and for users to trust results.

The net effect: users see sameness, slower paths to answers, and more noise than signal. That’s why behavior is shifting.

## Consumers Are Turning To LLMs

* LLMs provide fast, synthesized answers—no pogo-sticking across tabs.  
* They handle intent shifts (clarification, follow-ups, constraints) in natural language.  
* They reduce cognitive load: fewer decisions, less filtering.  
* They’re increasingly embedded: in search, browsers, IDEs, phones, and productivity suites.

Implication: Your content strategy must assume people are “asking an assistant,” not “typing keywords.”

## Alternative Search Engines Matter (Kagi, Perplexity, Others)

* [Kagi](https://kagi.com/) emphasizes quality, user control, and less clutter; it’s paid, which aligns incentives with users.  
* [Perplexity](https://perplexity.ai/) delivers direct answers with citations and often routes traffic to sources more generously.  
* Niche engines (e.g., You.com, marginalia, academic search) are experimenting with signal weighting, community curation, and LLM synthesis.

Why it matters: These platforms often reward authenticity, author transparency, clean technical markup, and thoughtful sourcing more than keyword gaming.

## How LLM Crawlers Behave Differently

Traditional crawlers (e.g., Googlebot) index pages to rank them later. LLM-oriented crawlers gather content to train models or to power retrieval-augmented generation (RAG). Key differences:

* Coverage vs. comprehension: LLM crawlers care about extractable knowledge, not just indexable text. Structured context and clean segmentation matter.  
* Freshness windows: Many assistants blend a static foundation model with live retrieval. Ensuring your latest content is easily retrievable (feeds, sitemaps, changelogs) is critical.  
* Source selection: LLMs favor sources that are:  
    * Highly structured (schema.org, JSON-LD, well-labeled tables, consistent headings).  
    * Authoritative (clear bylines, credentials, org identity, outbound citations).  
    * Stable and canonical (fewer duplicative URLs, strong canonical tags).  
* Robots and permissions: Some LLM crawlers respect robots.txt and specific User-Agents; others use headless browsers, fetch APIs, or partner datasets. Maintain explicit rules, allowlisting, and monitoring.

## How LLM Logic Differs From Google’s Ranking Algorithms

* Retrieval vs. ranking: Google ranks documents against a query. LLMs often retrieve a small set of passages, then synthesize an answer.  
* Semantic tolerance: LLMs are less brittle than keyword match; they map concepts across synonyms and related ideas.  
* Chain-of-thought and tool use: LLMs “reason” over retrieved content and may call tools (calculators, code, datasets) to answer precisely.  
* Citation dynamics: LLMs can cite fewer, higher-quality sources that directly support a claim. If your page doesn’t contain crisp, quotable evidence, you’re invisible—even if you rank in a traditional SERP.  
* Task orientation: LLMs bias toward completion—checklists, steps, templates—rather than listing options.

Bottom line: Optimizing for LLMs means optimizing for extract-ability, verifiability, and usefulness in synthesis.

## Make Your Content Findable by LLMs

1) Structure and markup  
* Use schema.org (Article, HowTo, FAQPage, Product, Organization, Person, Event, Dataset).  
* Include explicit definitions, bullet points, numbered steps, pros/cons tables, and key takeaways boxes—great for chunking and quoting.  
* Provide high-signal elements: abstracts, TL;DRs, summaries, FAQs, and glossaries.

2) Evidence and attribution  
* Support claims with primary data, citations, and links to reputable sources.  
* Expose data as CSV/JSON where relevant; use well-labeled tables with clear headers and units.  
* Include author bios, credentials, and last-updated timestamps.

3) Technical accessibility  
* Fast pages, clean HTML, stable URLs, strong internal linking.  
* XML sitemaps for content and media; add a changelog or “What’s new” feed.  
* Consistent canonicalization; avoid thin/duplicative pages.  
* Robots.txt: explicitly permit reputable LLM User-Agents you want; block where appropriate.

4) Content design for synthesis  
* Write modularly: short sections with descriptive H2/H3s that stand alone.  
* Put definitive statements near the top: definitions, formulas, key steps.  
* Provide “copy-ready” snippets: code blocks, formulas, checklists, and decision trees.

5) Guardrails and licensing  
* Add a clear content license and AI usage policy page.  
* Watermark where appropriate; embed provenance metadata (e.g., IPTC for images).

## The Basics Still Matter (More Than Ever)

* Quality over volume: publish fewer, deeper, better-sourced pieces.  
* Originality: offer unique data, frameworks, and POV—not summaries of summaries.  
* Human voice and utility: user-tested tutorials, real screenshots, benchmarks, failure modes.  
* E‑E-A-T signals: experience, expertise, author identity, and accountability.

These basics are exactly what LLMs seek when choosing what to cite.

## Rethink Your SEO Budget

A lot of legacy SEO work has been commodified: generic keyword lists, templated briefs, link swaps, and over-optimized H1s. If an agency isn’t experimenting with LLM-era tactics—structured evidence, retrieval optimization, prompt-optimized content design, and measurement beyond organic sessions—you’re subsidizing outdated playbooks.

Where to spend instead:  
* Information architecture for retrieval: content hubs, canonical source pages, entity pages.  
* Data journalism: proprietary datasets, surveys, benchmarks, calculators.  
* Author programs: credible bylines, SME interviews, contributor networks.  
* RAG-ready assets: clean datasets, API docs, FAQs, HowTos, and “reasoning-friendly” content.

## What We’re Seeing In The Data

Across client sites, we see:  
* Entrances shifting: more referrals labeled as “Direct,” “Unknown,” or from AI assistants that don’t pass referrers.  
* Overall traffic pressure: informational queries get answered in LLM chats; fewer clicks to commodity content.  
* More value from high-intent pages: calculators, decision guides, implementation playbooks perform comparatively better.  
* Longer-tail success: pages that solve niche, high-stakes problems earn consistent citations from assistants.

Interpretation: The pie of generic informational traffic is shrinking, but the value of authoritative, specialized content is rising.

## Practical Playbook: What To Do Next (Quarter-by-Quarter)

Quarter 1: Foundation  
* Audit structure: headings, schema, canonical tags, internal linking, sitemaps.  
* Add author pages, credentials, and last-updated stamps site-wide.  
* Create a “Source of Truth” hub for your core topics with definitive summaries and citations.  
* Publish a content and AI usage policy; update robots.txt with LLM crawler directives.

Quarter 2: Evidence and Extract-ability  
* Add TL;DRs, FAQs, tables, and checklists to top 50 pages by value.  
* Launch a data/insights program: one proprietary dataset or benchmark per quarter.  
* Convert legacy guides into modular sections with quotable claims and references.

Quarter 3: Diversify Discovery  
* Ship a “What’s new” feed and change logs; submit to relevant discovery channels.  
* Repurpose into structured formats: CSV/JSON downloads, API endpoints, notebooks.  
* Engage alternative engines: test Kagi and Perplexity ads or partnerships where available.

Quarter 4: Measure What Matters  
* Track brand search, direct sign-ups, assisted conversions, and mention/citation monitoring—not just sessions.  
* Correlate content updates with assistant citations and downstream conversions.  
* Prune or consolidate under-performing pages that cannibalize authority.

## New KPIs For An LLM-First World

* Assistant-attributed citations and mentions (where detectable).  
* Brand demand and navigational queries.  
* Engagement with structured assets (downloads, copy events, calculator usage).  
* Qualified conversions from high-intent pages.  
* Time-to-update and freshness coverage of key topics.

## Additional Opportunities To Include

* Build “assistant-friendly” tools: calculators, selectors, prompts, and APIs that LLMs can reference.  
* Provide evaluation criteria: decision matrices and checklists LLMs can quote.  
* Offer model-ready context: a public docs site with stable anchors and versioning that RAG systems love.  
* Experiment with retrieval beacons: concise “fact cards” or “spec sheets” pages per entity.  
* Community verification: comments from SMEs, GitHub issues, changelogs—signals of living expertise.

## Closing Thought

LLMs don’t replace search; they rewire discovery. Optimize for being the best source to synthesize—not merely the best page to rank. If you make your knowledge easy to retrieve, verify, and quote, assistants will increasingly bring your expertise to your audience—even when the click never happens.
