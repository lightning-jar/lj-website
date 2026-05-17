---
title: "Pimcore or OpenDXP: A Fork in the Road for Long-Tenured DXP Stacks"
metaTitle: "Pimcore vs OpenDXP After the GPLv3-to-POCL Pivot"
slug: opendxp-pimcore-fork
description: Pimcore relicensed its Community Edition away from GPLv3, removed the ExtJS admin UI, and now requires a full copyleft-dependency purge to upgrade. OpenDXP forks the last GPLv3 release. Here's how we're advising clients.
date: 2026-05-17
draft: false
tags: [pimcore, opendxp, open-source, dxp, licensing]
image: https://lj-01.nyc3.cdn.digitaloceanspaces.com/images/blog/astronaut-bunny.webp
imageDescription: A watercolor painting of a road forking through a forest
author: Kevin Peckham
quote:
  text: "Upgrading to Pimcore 12 is not really an upgrade. It is a license change, a UI rewrite, and a dependency-graph reconstruction, all on the same release."
  attribution: Kevin Peckham, Principal at Lightning Jar
glossary:
  - term: DXP (Digital Experience Platform)
    definition: An integrated platform for managing and delivering digital experiences across channels, typically combining PIM, DAM, content management, and commerce capabilities.
  - term: GPLv3
    definition: The GNU General Public License version 3, a strong copyleft open-source license that requires derivative works to be distributed under the same terms.
  - term: Copyleft
    definition: A licensing approach that requires modified and derived versions of a work to carry the same license, ensuring downstream freedoms are preserved.
  - term: POCL (Pimcore Open Core License)
    definition: Pimcore's own source-available license, introduced in 2025, that permits commercial use below a revenue threshold but is not OSI-approved open source and is incompatible with copyleft dependencies.
  - term: Source-Available
    definition: Software whose source code can be read and modified but whose license imposes restrictions that disqualify it from the Open Source Initiative's definition of open source.
  - term: OSI (Open Source Initiative)
    definition: The body that maintains the Open Source Definition and approves licenses that meet it. Licenses like SSPL, BSL, and POCL are not OSI-approved.
  - term: Fork
    definition: A new, independently maintained codebase created from a copy of an existing project, typically to continue development under different governance or licensing.
  - term: Community Edition
    definition: The freely available, self-hostable edition of Pimcore, historically GPLv3-licensed and the basis for most long-tenured Pimcore deployments.
  - term: Pimcore Studio
    definition: The new admin interface for Pimcore that replaces the legacy ExtJS-based Admin UI and becomes mandatory in Pimcore 12.
  - term: ExtJS Admin UI
    definition: The classic ExtJS-based Pimcore back-office interface that nearly all custom admin extensions of the last decade were built against, removed entirely in Pimcore 12.
  - term: SSPL (Server Side Public License)
    definition: A source-available license created by MongoDB and adopted by Elastic and Redis, not recognized as open source by the OSI.
  - term: BSL (Business Source License)
    definition: A source-available license used by HashiCorp for Terraform that converts to an open-source license after a delay; the relicensing prompted the OpenTofu fork.
additionalReading:
  - title: "Why Open Source Beats Proprietary Platforms for B2B Websites"
    url: "/blog/open-source-b2b-advantage"
  - title: "Questions, Decisions & Compromises"
    url: "/blog/questions-decisions-compromises"
  - title: "Why We Left Wordpress Behind"
    url: "/blog/leaving-wordpress"
sources:
  - title: "Breaking Free: Pimcore Says Goodbye to GPL and Enters a New Era with POCL"
    author: "Pimcore"
    publication: "Pimcore Blog"
    url: "https://pimcore.com/en/resources/blog/breaking-free-pimcore-says-goodbye-to-gpl-and-enters-a-new-era-with-pocl"
  - title: "Upgrading Pimcore from Version 11.x to Version 12"
    author: "Pimcore"
    publication: "Pimcore Documentation"
    url: "https://docs.pimcore.com/platform/2025.3/Pimcore/Installation_and_Upgrade/Updating_Pimcore/V11_to_V12/"
  - title: "Upgrading to Pimcore 2025.1: Legal & License Compliance Guide"
    author: "Factory.dev"
    publication: "Factory.dev Pimcore Knowledge Base"
    url: "https://factory.dev/pimcore-knowledge-base/how-to/pimcore-2025-1-legal-compliance-guide"
  - title: "Migrating from GPLv3 to Pimcore Open Core License (POCL)"
    author: "Pimcore"
    date: "2025-04"
    publication: "Pimcore Whitepaper"
    url: "https://144170849.fs1.hubspotusercontent-eu1.net/hubfs/144170849/Whitepaper%20-%20Migrating%20from%20GPLv3%20to%20Pimcore%20Open%20Core%20License%20(POCL)%20-%20April%202025%201.pdf"
  - title: "Pimcore's Switch from GPLv3 to the Pimcore Open Core License"
    author: "Blackbit"
    publication: "Blackbit"
    url: "https://digital-commerce.blackbit.com/en/pimcores-wechsel-von-gplv3-zur-pimcore-open-core-lizenz-hintergr%C3%BCnde-und-konsequenzen-f%C3%BCr-unternehmen"
  - title: "OpenDXP — Official Site"
    author: "DACHCOM.DIGITAL"
    publication: "opendxp.io"
    url: "https://www.opendxp.io/en"
  - title: "OpenDXP — README and Upstream-Origin Disclosure"
    author: "OpenDXP"
    publication: "GitHub"
    url: "https://github.com/open-dxp/opendxp/blob/1.x/README.md"
  - title: "OpenDXP — Packagist Package"
    author: "OpenDXP"
    publication: "Packagist"
    url: "https://packagist.org/packages/open-dxp/opendxp"
  - title: "Amazon Forks Elasticsearch and Kibana as OpenSearch"
    author: "InfoQ"
    date: "2021-04"
    publication: "InfoQ"
    url: "https://www.infoq.com/news/2021/04/amazon-opensearch/"
  - title: "Terraform Fork Gets a New Name, OpenTofu, and Joins Linux Foundation"
    author: "TechCrunch"
    date: "2023-09"
    publication: "TechCrunch"
    url: "https://techcrunch.com/2023/09/20/terraform-fork-gets-a-new-name-opentofu-and-joins-linux-foundation/"
  - title: "OpenTofu Announces Fork of Terraform"
    author: "OpenTofu"
    date: "2023-09"
    publication: "OpenTofu Blog"
    url: "https://opentofu.org/blog/opentofu-announces-fork-of-terraform/"
  - title: "Linux Foundation Forks the Open Source Redis as Valkey"
    author: "The New Stack"
    date: "2024-04"
    publication: "The New Stack"
    url: "https://thenewstack.io/linux-foundation-forks-the-open-source-redis-as-valkey/"
---

Over the last eighteen months, organizations running Pimcore have been handed a decision their original technology selection did not anticipate. The platform they adopted under the GNU General Public License v3, the platform many of them have customized, integrated, and operated for the better part of a decade has been relicensed. It is no longer open source. The admin UI most of those customizations were written against has been removed. And the upgrade path to the new major version requires auditing and replacing every copyleft third-party dependency in the codebase.

At the same time, a community-driven fork of Pimcore Community Edition has appeared and is now publicly available under the original GPLv3 license. It is called [OpenDXP](https://www.opendxp.io/en), and it was launched in February 2026 by a Swiss agency, [DACHCOM.DIGITAL](https://www.dachcom.com/de-ch), with the explicit purpose of preserving a GPLv3-licensed continuation of the platform.

For our clients on Pimcore, this is not an academic discussion. It is a decision that has to be made before the next major upgrade cycle. This article explains what changed, what OpenDXP is, why this situation looks familiar to anyone who has watched the open-source ecosystem over the last five years, and how we are currently advising clients.


## Part 1: What Actually Changed at Pimcore

The temptation, when summarizing a vendor's strategy shift, is to reduce it to a single headline. In Pimcore's case the headline is usually "the license changed." That description is true but incomplete. Three things changed simultaneously, and they compound each other.

### Change 1 — The License: GPLv3 → POCL

In spring 2025, Pimcore GmbH announced that the Pimcore Community Edition would transition from the GNU General Public License v3 to a new license of its own authorship: the **Pimcore Open Core License**, or POCL. Version **2024.4 is the last release of the Community Edition under GPLv3**. Every release from **Pimcore 2025.1** onward is licensed under POCL.

POCL is explicitly **not** an open-source license under the Open Source Initiative's definition. Pimcore and Pimcore's partners describe it as "source-available": you can read the code, you can customize it, you can build extensions on top of it, and you can operate it commercially up to a revenue threshold of **€5 million in global annual revenue**. Above that threshold, a commercial license from Pimcore is required. The license also restricts redistribution and prohibits offering Pimcore core as a SaaS without a license.

For organizations that originally selected Pimcore *because* it was GPLv3, the relevant point is not whether POCL is reasonable as a license (for many businesses it will be). The relevant point is that it is a different license than the one the decision was made under, and that change is not optional for anyone wishing to upgrade past 2024.4.

### Change 2 — The Admin UI: ExtJS Removed, Pimcore Studio Mandatory

The second change is technical and, for most production Pimcore deployments, expensive.

Every Pimcore project of the last decade was built against the **ExtJS-based Admin UI**, the classic Pimcore back-office interface that ships with the platform. Custom data object behaviors, class definition tweaks, perspectives, custom action buttons, bundle-supplied admin panels, integrations with PIM / DAM editorial workflows: all of these were typically implemented as ExtJS extensions to that UI.

With **Pimcore 12 / 2026.1**, the ExtJS Admin UI is fully removed from the codebase. The replacement, **Pimcore Studio**, becomes the sole supported interface. The platform's own upgrade documentation confirms it: bundles that implemented `BundleAdminClassicInterface` or used `BundleAdminClassicTrait` no longer work; the `getJsPaths()` and `getCssPaths()` extension points are gone; admin panels that were ExtJS-based must be re-implemented in the Pimcore Studio framework.

Version **2025.4** is the last release that runs both the legacy and Studio UIs in parallel. After that, Studio is the only option.

For greenfield Pimcore projects, this is fine; they will simply be built on Studio from the start. For 10+ year deployments with bespoke admin extensions, it is a re-implementation engagement.

### Change 3 — The Wholesale Copyleft-Dependency Purge

This third change is the one most often missed in summaries of Pimcore's strategy shift, and it is arguably the most consequential for established codebases.

POCL is fundamentally **incompatible with all copyleft licenses** (GPL, LGPL, and AGPL) when those copyleft components are combined with Pimcore core. POCL Section 3.4 prohibits the mixing explicitly. This is not a technical incompatibility; it is a legal one, baked into the license text.

Pimcore's own GPLv3 bundles were relicensed to POCL in version 12 to remove the internal conflict. The `pimcore/platform-version` repository's 2026.1 work even includes a commit titled "Remove gpl licence." But the cleanup does not stop at Pimcore-authored code. **Every third-party copyleft dependency in the project's composer.json must also be audited and replaced** before the V12 upgrade can be performed in a legally compliant way.

Pimcore's upgrade guidance and the compliance playbooks published by Pimcore partners are unambiguous: *"If dependencies with incompatible licenses are identified, you must replace them with alternatives under a compatible license before upgrading to Pimcore 12. Otherwise, the upgrade cannot be performed in a legally compliant way."*

For a long-tenured codebase that has accumulated GPL/LGPL-licensed PDF libraries, image-processing tools, reporting components, or integration bundles over a decade, this is a non-trivial engagement. Each dependency has to be identified, evaluated, and either:

- replaced with a permissively-licensed alternative,
- isolated so it does not link against Pimcore core,
- refactored to remove the dependency, or
- relicensed with permission from the upstream maintainer (in practice, rarely available).

The combined effect of the three changes is that "upgrading to Pimcore 12" is not really an upgrade in the sense Pimcore users have understood the word for the last decade. It is a license change, a UI rewrite, and a dependency-graph reconstruction, all on the same release.

---

## Part 2: This Shape of Decision Is Now Familiar

If the situation feels like one you have read about before, it should. Over the last five years, the open-source ecosystem has seen a recognizable pattern repeat itself: a commercial sponsor of a widely-adopted OSS project relicenses the project under a non-OSS or source-available license, a community-and-vendor coalition forks the last open-source version, and a new governance home is established. The fork inherits the existing ecosystem of integrations, knowledge, and operators; the relicensed product continues on its commercial trajectory; and the two diverge from that point.

A short history is useful here, because it puts the Pimcore/OpenDXP decision in context.

### Elasticsearch → OpenSearch (2021)

In **January 2021**, Elastic relicensed Elasticsearch and Kibana from the **Apache License 2.0** to a dual SSPL / Elastic License model, neither of which is recognized as open source by the OSI. Elastic's stated reason was that AWS was operating a managed Elasticsearch service without contributing meaningfully back to the project.

In **April 2021**, Amazon forked the last Apache-licensed release (Elasticsearch 7.10.2) and announced **OpenSearch**, retaining the Apache 2.0 license. The fork was later transferred to the Linux Foundation. A coalition including Red Hat, SAP, Logz.io, and others lined up behind it. Today OpenSearch is the default Elasticsearch-compatible option in much of the cloud ecosystem.

### Terraform → OpenTofu (2023)

On **August 10, 2023**, HashiCorp announced that its core products — including Terraform — would be relicensed from the **Mozilla Public License v2** to the **Business Source License (BSL)**, a source-available license. The community response was fast: by August 15, the **OpenTF manifesto** was published, and on September 5 the fork was officially released. On **September 20, 2023**, the project — by then renamed **OpenTofu** — joined the **Linux Foundation**. The manifesto attracted endorsements from 140+ companies and the project launched with more than 18 full-time-equivalent engineers committed across multiple sponsoring organizations.

OpenTofu was forked from Terraform 1.5.6 — the last MPL-licensed release — and has continued to evolve in parallel since.

### Redis → Valkey (2024)

On **March 20, 2024**, Redis Ltd. relicensed Redis from the **3-clause BSD license** to a dual SSPL / RSALv2 model — again, neither license OSI-approved. Within roughly two weeks, on **April 1, 2024**, the Linux Foundation announced **Valkey**, a BSD-licensed fork of Redis 7.2.4, with backing from AWS, Google Cloud, Oracle, and others. Valkey established a Technical Steering Committee model to prevent single-vendor control and to keep the protocol-compatibility surface stable. Within weeks the project had passed 50 contributing companies and 150+ individual contributors. (Redis itself subsequently moved to AGPLv3 in 2025, but by that point the Valkey community had its own momentum.)

### MySQL → MariaDB (2009)

The original case in the modern era is older but still instructive. When **Sun Microsystems** — which had acquired MySQL AB — was acquired by **Oracle** in 2009, concern over Oracle's stewardship led MySQL's original co-founder Monty Widenius to fork the database as **MariaDB**, retaining GPL licensing and explicit community governance. Sixteen years later, MariaDB is the default in many Linux distributions and powers a large fraction of production deployments that would otherwise have been MySQL.

### The Pattern, Stated Plainly

These cases differ in their specifics. The licenses involved, the size of the projects, the sophistication of the forking coalitions all vary, but they share a common architecture:

1. A commercial sponsor changes the terms under which an established OSS project is distributed.
2. That change makes the project no longer open source under the OSI definition (or no longer practical for some segment of the user base).
3. A community-and-vendor coalition forks the last OSS-licensed release.
4. The fork stabilizes under neutral governance and inherits the original ecosystem of integrators, hosting providers, and operators.
5. The relicensed product continues, often successfully, but optimized for a different customer segment than the one the original OSS users represented.

The Pimcore → OpenDXP situation fits this pattern. The fork is younger and smaller than OpenSearch, OpenTofu, or Valkey. DACHCOM.DIGITAL is one anchor sponsor rather than the Linux Foundation plus three hyperscalers, but the underlying decision shape is the same. And, importantly, none of the prior forks have died.

---

## Part 3: What OpenDXP Actually Is

OpenDXP (*Open Data & Digital Experience Platform*) is a community-driven fork of Pimcore Community Edition that was made public on **February 12, 2026**. It is built on the following facts:

- **Forked from Pimcore CE v11.5.13**, commit `9246a42`. This is the last meaningful release of Pimcore CE before the licensing transition.
- **Licensed under GPLv3 in perpetuity** as a community codebase. The project is explicit in its stated intent: to preserve a GPLv3-licensed Pimcore continuation for organizations that want one.
- **Initiated and sponsored by [DACHCOM.DIGITAL](https://www.dachcom.com/de-ch)**, a Swiss digital agency (Rheineck, Switzerland) with a substantial history of Pimcore implementation work — meaning the project's anchor sponsor has direct operational reasons to keep the codebase healthy.
- **Independent of Pimcore GmbH** — not affiliated, not endorsed, not sponsored. The project is careful about the Pimcore® trademark, which remains a registered mark of Pimcore GmbH; OpenDXP uses it only descriptively to identify the upstream origin.
- **Architecturally faithful to Pimcore 11**. Same Symfony foundation, same data-modeling approach, same admin-bundle UI model. The composer package is `open-dxp/opendxp`; the public repository is [github.com/open-dxp](https://github.com/open-dxp/); the documentation lives at `docs.opendxp.io`.
- **Full DXP scope**: PIM, DAM, Headless CMS, and Composable Commerce, with bundle-level forks (`admin-bundle`, `ecommerce-framework-bundle`, `web-to-print-bundle`, `system-info-bundle`, others) maintained as separate repositories.

A useful way to describe OpenDXP is that it is *what Pimcore 11 would have continued to be* if the licensing pivot had not happened. That is the design intent, and the codebase reflects it.

---

## Part 4: How We Are Advising Clients

This is the section where we move from "what happened" to "what to do about it." Our default recommendation for clients currently operating on Pimcore Community Edition is to **migrate to OpenDXP** before adopting any Pimcore 2025.x or 2026.x release. The reasoning has three layers.

### Layer 1: Preserve the Original Contract

The first reason is the simplest. The platform was selected under GPLv3. That license was part of the value proposition: predictable terms, no revenue clauses, no audit overhead specific to one vendor, no single point of policy change.

OpenDXP preserves that contract. Pimcore 2025+ does not. For a client whose procurement, legal, and operations posture was built around GPLv3, the lower-disruption move is to follow the GPLv3 codebase. POCL is a new license that legal and procurement teams need to evaluate independently, and Pimcore retains the right to revise it for future versions.

### Layer 2: Avoid the Three-Cost Upgrade

The second reason is operational. Continuing with Pimcore is not "keep doing what you are doing." It is, in one upgrade cycle:

1. **Accepting a new, non-OSS license** (POCL), with the procurement and audit re-evaluation that implies.
2. **Likely entering a commercial license relationship** if the organization's revenue is at or near €5M, with the costs and contractual entanglement that implies.
3. **Re-implementing custom admin UI** in Pimcore Studio (the ExtJS Admin UI is gone in V12), with the engineering cost that implies for any non-trivial deployment.
4. **Auditing every third-party dependency** in the project and replacing every copyleft-licensed one before the upgrade is legally compliant.

OpenDXP keeps all four of those costs at, or near, zero. It is forked from the same v11 codebase the client is already running, it remains GPLv3 (so existing copyleft dependencies remain legal), and the existing admin UI model is preserved.

The standard objection here *"but doesn't moving to OpenDXP also have costs?"* is fair, and the honest answer is: yes, but smaller and more bounded. The migration from a current Pimcore 11 installation to OpenDXP 1.x consists primarily of namespace and package-name changes plus the documented OpenDXP 1.0 upgrade notes. It is not a UI rebuild, not a license renegotiation, and not a dependency-graph reconstruction. It is a fork-following exercise.

### Layer 3: Lower Vendor-Concentration Risk

The third reason is structural. The same dynamics that produced the Pimcore licensing pivot in 2025 could produce another in 2027 or 2029. A vendor that has demonstrated willingness to change the terms of distribution once will, all else equal, do so again when business conditions favor it.

GPLv3, by contrast, is externally drafted, externally maintained, and stable. The project's destiny is no longer tied to a single commercial sponsor's strategic decisions. For an enterprise that intends to operate the platform for another decade, this matters.

### When We *Don't* Recommend the Move

A few scenarios in which staying on Pimcore is the better call:

- **The client is already on Pimcore Professional, Enterprise, or Enterprise PaaS.** The licensing change applies to the Community Edition; commercial-licensed deployments are unaffected by the GPLv3 → POCL pivot.
- **The client's deployment is very recent or very simple.** A greenfield Pimcore install built within the last 12 months, with minimal custom admin code and a clean dependency graph, will face a much smaller V12 upgrade than a decade-old codebase. The migration math can swing either way.
- **The client is structurally committed to Pimcore's commercial offerings** for support contract reasons, partnership reasons, or roadmap reasons. In that case the license change is a formality.

For most of the established clients we work with, none of these conditions hold, and OpenDXP is the right call.

---

## Part 5: An Honest View of OpenDXP's Risk Profile

This section is here on purpose. Recommending a young fork is not free of risk, and the right way to recommend it is to name those risks rather than minimize them.

**OpenDXP is new.** The project launched publicly in February 2026. The release cadence, contributor base, and long-term maintainership patterns are still being established. That is true of every fork at the equivalent stage.

**It has one primary sponsor at the moment.** DACHCOM.DIGITAL is a credible commercial anchor — they implement and operate the platform, so they have business reasons to keep it healthy — but a project's long-term resilience benefits from a broader sponsor base. The historical comparison cases (OpenSearch, OpenTofu, Valkey) had multiple hyperscaler-class backers and Linux Foundation governance from week one. OpenDXP does not, yet.

**The bundle ecosystem will fragment.** Some commercial Pimcore bundle vendors will support OpenDXP, some will support Pimcore POCL, some will support both, and some will not survive the split. This is the messiest part of any fork's first 18 months and worth budgeting for.

**Trademark and naming friction will exist.** OpenDXP is careful with the Pimcore® mark and explicit that it is not a competitor. That is the right legal posture but it does create some friction in marketing and documentation. Expect some adjustment as the project matures.

Against this, the relevant counter-question is *compared to what?* The Pimcore path has its own risk profile — a license that can be revised again, a vendor relationship that has just demonstrated a willingness to change terms unilaterally, an architecture that has been substantially reshuffled in one release cycle, and a dependency audit that has to be performed on a codebase the team did not choose to refactor. Both paths have risks. OpenDXP's are the risks of a young project; Pimcore's are the risks of a maturing commercial OSS company optimizing for a different customer segment than the long-tail Community Edition installed base.

Our judgment is that for established Community Edition deployments, OpenDXP's risk profile is the more manageable of the two.

---

## Closing

Open-source license pivots have become a recurring feature of the commercial software landscape. They are not, on their own, a sign of bad faith — companies grow, business models evolve, sponsors of OSS projects sometimes need to recapture commercial value to remain viable. But they do mean that the original contract under which an enterprise selected a platform has changed, and the right response to that change is a deliberate, informed re-selection rather than an automatic upgrade.

For Pimcore's long-tenured Community Edition users, the deliberate re-selection points, today, at OpenDXP. The fork is young but credible. It preserves the license, the architecture, and the operational assumptions that the original Pimcore selection was made under. And, perhaps most importantly, it gives organizations the option to evolve their DXP stack on their own timetable — rather than on the schedule of a vendor whose priorities have moved on.

We are guiding our clients through this decision case-by-case, but the default recommendation is clear. If you are operating a Pimcore CE installation today and you have been wondering whether to move, this is the year to make the call.

---

*If you are weighing this decision for your own organization, we are happy to talk through the specifics of your Pimcore deployment and the practical migration shape. Reach out at [opendxp@lightningjar.com](mailto:opendxp@lightningjar.com).*
