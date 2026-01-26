---
title: Why We Left WordPress Behind
metaTitle: Leaving Wordpress
slug: leaving-wordpress
description: This article looks at the reasons why Lightning Jar is leaving the WordPress platform.
date: 2025-12-01
draft: true
tags: [wordpress, sveltekit, serverless]
image: https://lj-01.nyc3.cdn.digitaloceanspaces.com/images/blog/lemons.webp
imageDescription: hands holding spectacles against a digital screen
author: Kevin Peckham
quote: 
  text: "Migrating our clients away from the WordPress ecosystem has been an enormous success. Operationally, we've seen a significant reduction in support tickets and increased developer velocity. Our clients are now more secure, performant, and happier."
  attribution: "Alex Cantu, CTO"
glossary:
  - term: Open Source
    definition: Software whose source code is publicly available, allowing anyone to view, modify, and distribute it. Examples include WordPress, SvelteKit, and Linux.
  
  - term: Jamstack
    definition: A modern web architecture that separates the frontend presentation layer from backend services and data. Sites are pre-built as static files and enhanced with JavaScript, served via CDN, with dynamic functionality handled through APIs.
  
  - term: Serverless
    definition: A cloud computing model where the cloud provider automatically manages server infrastructure, scaling resources on-demand. Developers deploy code without managing servers, paying only for actual compute time used.
  
  - term: Content Security Policy (CSP)
    definition: A security standard that helps prevent cross-site scripting (XSS), clickjacking, and other code injection attacks by allowing website owners to control which resources can be loaded and executed on their pages.
  
  - term: Headless CMS
    definition: A content management system that separates content storage and management (backend) from content presentation (frontend). Content is delivered via APIs, allowing it to be displayed on any platform or device.
  
  - term: Server-Side Rendering (SSR)
    definition: A technique where web pages are generated on the server for each request, sending fully-rendered HTML to the browser. This improves initial page load performance and SEO compared to client-side rendering.
  
  - term: SvelteKit
    definition: A modern web framework for building high-performance applications with Svelte. It provides server-side rendering, routing, and other full-stack capabilities while maintaining a small bundle size and fast runtime performance.
  
  - term: LAMP Stack
    definition: A traditional web development stack consisting of Linux (operating system), Apache (web server), MySQL (database), and PHP (programming language). WordPress is built on this architecture.
  
  - term: Plugin
    definition: In WordPress, a piece of software that extends or adds functionality to the core platform. Plugins can range from simple features to complex systems, but require ongoing maintenance and updates.
  
  - term: TypeScript
    definition: A programming language that extends JavaScript by adding static type definitions. It helps catch errors during development, improves code documentation, and enhances developer tooling and productivity.
additionalReading:
  - title: "Why Open Source Beats Proprietary Platforms for B2B Websites"
    url: "/blog/open-source-b2b-advantage"
  - title: "Questions, Decisions & Compromises"
    url: "/blog/questions-decisions-compromises"
  - title: "Why SvelteKit is the Best Choice for Modern B2B Websites"
    url: "/blog/sveltekit-vs-wordpress-b2b"
---

Over the past 2-3 years, Lightning Jar has migrated roughly 90% of our formerly WP client websites away from WordPress. We still support a handful of WP sites, but the trend is clear: for most of our national and international clients in technology, energy, public transit, liquor, and manufacturing, modern [Jamstack](https://jamstack.org/what-is-jamstack/) architectures deliver better security, performance, governance, and developer velocity.

This is a conscious uncoupling of our clients from the WordPress ecosystem, for reasons outlined below. To be clear, there are a lot of talented people in the WP ecosystem doing good work, but our concerns are less about any one theme or plugin and more about broader ecosystem dynamics around WordPress. Here's what led us to change course.

## Security: Reducing Blast Radius and Attack Surface

* WordPress is a high-profile target for automated attacks, which increases risk and operational noise for our clients, especially those in regulated or sensitive industries like cybersecurity and finance.
* Enforcing robust security controls such as strict [Content Security Policies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP) often collides with legacy assumptions in the WP stack.
* Moving to [serverless](https://www.cloudflare.com/learning/serverless/why-use-serverless/) and framework-driven architectures has reduced surface area, simplified hardening, and improved baseline posture.

## Hidden Costs: The Upkeep Tax

* WordPress deployments can be inexpensive to launch, but the long tail of maintenance is real.
* The plugin-first paradigm translates to constant updates, regression testing, and surprise breakage from undocumented changes.
* When we analyzed the time spent on legacy maintenance versus new feature development, the economics no longer made sense for most projects.

## Plugin Fatigue: Quality Varies, Complexity Compounds

* There are great plugins—and many not-so-great ones. Evaluating, vetting, and maintaining them is costly.
* Poor documentation and inconsistent quality create friction.
* Client-driven plugin additions can quickly destabilize environments and blur governance lines.

## Project Governance: Confidence Matters

* Our decision to move away from WordPress predated recent controversies, but the governance volatility of the past year reaffirmed that choice. [read more about this](https://www.therepository.email/wordpress-contributors-and-community-leaders-call-for-governance-reform-in-rare-open-letter)
* As an agency, we need predictable, transparent roadmaps and a healthy ecosystem for long-term client bets.

## Hosting: Serverless Wins for Most Use Cases

* Shifting from self-managed servers to on-demand, [serverless hosting](https://www.prisma.io/dataguide/serverless/what-is-serverless) has lowered costs, reduced operational overhead, and eliminated a class of infrastructure headaches.
* Many clients also value the energy efficiency of serverless for low-to-midsize traffic profiles, aligning technical and sustainability goals.

## Developer Experience: SvelteKit Accelerates Delivery

* [SvelteKit](https://svelte.dev/docs/kit/performance) has been a major unlock for our team. We routinely ship new sites in half the time compared to WordPress builds. [read more](https://sveltekit.io/blog/make-your-sveltekit-app-faster)
* We prioritize custom design and custom code over themes and UI kits (more than 90% of our work is bespoke) to hit performance, accessibility, and brand fidelity targets.
* The result: faster iterations, fewer dependencies, and cleaner architectures.

## Rethinking Content Management: Use It Where It's Needed

In 20 years of building sites, a pattern has held:

* Many clients don't actually want to manage content themselves.
* Some believe they do, but won't in practice.
* Others don't need a CMS at all for their marketing presence.
* Supporting ad-hoc client edits can consume more resources than simply handling content updates for them.

Our approach now:

* We do not default to a full-stack CMS for every site.
* We implement [headless CMS](https://www.contentful.com/headless-cms/) selectively, where it's truly needed. [read more](https://aws.amazon.com/what-is/headless-cms/)
* We include free content updates for the first year, then introduce or right-size a CMS with real usage data, not assumptions.

## From PHP/LAMP to Jamstack: Tooling, Talent, and Tempo

* We're agnostic about languages, but today's [JavaScript/TypeScript ecosystem](https://www.netguru.com/blog/typescript-benefits) offers superior tooling, DX, and cloud-native ergonomics for our use cases. [learn more](https://strapi.io/blog/benefits-of-typescript)
* [Server-side rendering](https://developer.mozilla.org/en-US/docs/Glossary/SSR) in frameworks like SvelteKit narrows historical PHP advantages.
* The talent market also leans in our favor—finding great JS engineers is generally easier than sourcing senior PHP talent with the flexibility agencies require.

## User Experience: The Paradigm Has Shifted

* WordPress was once the clearest path to self-serve content. Today, its authoring model often feels clunky for non-technical marketers.
* Many teams reach for platforms like [HubSpot](https://www.hubspot.com/comparisons/pardot-vs-hubspot) or [Pardot](https://hyperscayle.com/insights/pardot-vs-hubspot-which-marketing-automation-platform-is-right-for-you) for fast landing pages and integrated workflows, although admittedly, we're not big fans of their walled gardens and enormous price tags.
* The notion that marketing teams should directly manage security-sensitive plugins is increasingly untenable. Clear boundaries and purpose-built tooling lead to better outcomes.

## Where We Still Use WordPress

There are still some scenarios especially complex, authenticated, content-heavy platforms— where WordPress paired with excellent theme frameworks remains a defensible choice. We support those instances thoughtfully and continue to value the partners and tools that do it right.

## The Lightning Jar Approach Going Forward

* Architecture: Jamstack-first with SvelteKit, serverless hosting, selective headless CMS.
* Delivery: Custom design and code over themes; performance and accessibility by default.
* Governance: Minimize dependencies, maximize clarity, and right-size CMS capabilities.
* Support: First-year content updates included for most projects; CMS introduced only when justified by real usage.

WordPress helped define an era. For our clients' needs today—security, speed, sustainability, and maintainability we find modern JS frameworks and serverless platforms are the better fit.

If you're navigating similar trade-offs, we're happy to share what we've learned and help you choose the right path for your team and your roadmap.
