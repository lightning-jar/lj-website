---
title: Questions, Decisions & Compromises
metaTitle: Questions, Decisions & Compromises
slug: questions-decisions-compromises
description: This article proposes some thoughts on strategy, design, and implementation.
date: 2026-01-19
draft: false
tags: [strategy, design, implementation]
image: https://lj-01.nyc3.cdn.digitaloceanspaces.com/images/blog/avocados.webp
imageDescription: 
author: Kevin Peckham
quote: 
  text: "Strategy is the art of asking tough questions. Design is the art of making tough decisions. Implementation is the art of making tough compromises."
  attribution: Kevin Peckham, Principal at Lightning Jar
glossary: 
  - term: Interaction Patterns
    definition: Interaction patterns are reusable solutions to common user interface problems. They help designers create consistent and predictable interactions across different platforms and devices.
  - term: Information Architecture
    definition: The structural design of shared information environments. It involves organizing, labeling, and structuring content in a way that helps users find information and complete tasks effectively.
  - term: Wireframe
    definition: A low-fidelity visual representation of a user interface that shows the skeletal framework of a digital product. Wireframes focus on layout, content hierarchy, and functionality rather than visual design details.
  - term: Scope Creep
    definition: The uncontrolled expansion of project scope without corresponding adjustments to time, budget, or resources. It typically occurs when new features or requirements are added after project initiation without proper evaluation.
  - term: Fidelity
    definition: The level of detail and functionality represented in a design prototype or deliverable. Low-fidelity designs are rough and conceptual, while high-fidelity designs closely resemble the final product in appearance and interaction.
  - term: Discovery
    definition: The initial research and planning phase of a project where teams gather requirements, understand user needs, identify constraints, and define the problem space before moving into design and development.
  - term: Trade-offs
    definition: The balance between competing priorities or constraints in a project. Trade-offs involve sacrificing one aspect (such as features, time, or cost) to optimize another based on project goals and limitations.
  - term: Design Principles
    definition: Fundamental guidelines that inform design decisions and ensure consistency across a product or system. They serve as a shared reference point for teams to evaluate options and maintain coherent design direction.
additionalReading:
  - title: "Why We Left Wordpress Behind"
    url: "/blog/leaving-wordpress"
  - title: "Why SvelteKit is the Best Choice for Modern B2B Websites"
    url: "/blog/sveltekit-vs-wordpress-b2b"
  - title: "Why Open Source Beats Proprietary Platforms for B2B Websites"
    url: "/blog/open-source-b2b-advantage"
---

Recently I distilled my beliefs about design and process into three short maxims. I can't claim they are wholly original, but they are my own.
1. ***Strategy is the art of asking tough questions.***
2. ***Design is the art of making tough decisions***.
3. ***Implementation is the art of making tough compromises***.

I've seen these truths either honored or avoided. You probably have too. For better or worse, the difference always shows up in the end product.

## Strategy: Questions Are the Work

Strategy begins with asking questions because it's an act of learning, not of declaring. The questions are how we uncover constraints, clarify goals, expose [trade-offs](https://docs.lib.purdue.edu/cgi/viewcontent.cgi?article=1279&context=jpeer), and surface the shape of the problem we're actually solving. In strategy, premature certainty is the enemy; curiosity is the engine.

An agency leader I once worked with didn't see it that way. He pushed us to limit the number of questions we asked clients in [discovery](https://www.nngroup.com/articles/discovery-phase/) and throughout design. *"We're not trying to boil the ocean,"* he'd say. On the surface, that's a fair caution against [scope creep](https://en.wikipedia.org/wiki/Scope_creep). But it left me confused. Each question we wanted to ask was not about expanding scope, it was about narrowing ambiguity. We weren't boiling the ocean; we were trying to find the coastline.

Are there questions that should be avoided? Sure:
* Avoid questions that are performative rather than clarifying.
* Avoid questions whose answer won't change a decision or direction.
* Avoid questions that disrupt momentum without improving [fidelity](https://www.interaction-design.org/literature/article/what-kind-of-prototype-should-you-create).

Otherwise, fewer questions often means slower projects later: misaligned expectations, surprise constraints, rework, and erosion of trust. Strategy saves time by spending it well early, on the right questions.

## Design: Decisions Are the Craft

Design is where the uncertainties of strategy start collapsing into form. Here, decisions are not an interruption of design. They are the substance of design. To design is to choose: hierarchy over noise, clarity over options, defaults over ambiguity.

Another catchphrase from the same leader: *"No decisions. We want to move fast! Remember, NO decisions."* I still don't know what that meant. How does one design without making decisions? Even a [wireframe](https://www.interaction-design.org/literature/topics/wireframe) is a stack of decisions. Decisions about flow, emphasis, interaction, and what not to show.

Speed comes from sequencing decisions, not avoiding them.
* Make high-leverage decisions early ([information architecture](https://www.interaction-design.org/literature/topics/information-architecture), interaction patterns, [design principles](https://userpilot.com/blog/ux-design-principles/)).
* Time-box exploratory decisions (mood, direction, metaphors).
* Defer reversible, low-impact decisions without blocking momentum (icon choices, microcopy variations).
* Codify decisions as standards so future choices become defaults, not debates.

The fastest teams I've worked with were decisive, not reckless. They decided with intent, documented rationale, and revisited assumptions when data or business requirements demanded, not when opinions wandered.

## Implementation: Compromises Are the Bridge

If questions are the fuel of strategy and decisions are the craft of design, compromises are the craft of implementation. This is where ideas meet reality: budgets, backlogs, legacy systems, security, performance, compliance, timelines, and the very human limits of attention and energy.

Here, I agreed with that same agency leader: development requires compromise. The goal is not to avoid compromise but to make the right compromises, consciously and transparently. Good development turns [trade-offs](https://docs.lib.purdue.edu/cgi/viewcontent.cgi?article=1279&context=jpeer) into progress.

### A practical hierarchy helps:

* Compromise on polish, not principles.  
* Compromise on scope, not integrity.  
* Compromise on timeline, not truth.  

Compromise is not capitulation; it's the art of conserving what matters most while making something real.

## How These Fit Together

When teams stumble, it's often because these three modes get swapped or suppressed:
* Strategy without questions becomes theater -- assumptions, instead of listening.
* Design without decisions becomes drift -- endless exploration, little coherence.
* Implementation without compromise becomes fantasy -- beautiful plans, brittle systems.

When teams thrive, each mode empowers the next:
* Strategy asks great questions → Design knows what to decide.
* Design makes crisp decisions → Implementation knows where to compromise.
* Implementation feeds back constraints → Strategy asks better questions next time.

This loop (questions -> decisions -> compromises) creates momentum you can trust.

## A Note on Speed

Speed doesn't come from fewer questions or fewer decisions. It comes from:
* Asking the right questions at the right time.
* Making decisions at the right level of fidelity.
* Compromising in ways that preserve future options.

Speed is a byproduct of clarity. Clarity is a byproduct of questions and decisions.

## Closing

I still think about that *"No decisions"* mantra. If anything, it clarified my own stance: to proceed with intention and build things that last, we need more disciplined questions, more deliberate decisions, and more honorable compromises. That is not bureaucracy. That is craft.
