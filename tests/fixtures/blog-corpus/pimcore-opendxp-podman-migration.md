---
title: "Migrating a Decade-Old Pimcore Site to OpenDXP on Rootless Podman and Caddy"
metaTitle: "Pimcore to OpenDXP on Rootless Podman | Migration"
slug: pimcore-opendxp-podman-migration
description: "When Pimcore's license change pushed us to move a ten-year-old Community Edition deployment to OpenDXP, we used the migration to modernize everything underneath it too: a fresh RHEL server, rootless Podman for real container isolation, and Caddy replacing Apache and purchased certificates. Here's what changed, and why the client sleeps better."
date: 2026-05-20
draft: false
tags: [opendxp, pimcore, devops, security, migration]
image: https://lj-01.nyc3.cdn.digitaloceanspaces.com/images/blog/tortoise.webp
imageDescription: A watercolor painting of a sea turtle with a shell of wildflowers
author: Kevin Peckham
quote:
  text: "The container isn't just packaging. If the application is ever compromised, the attacker lands as an unprivileged, namespaced user under SELinux, not as anything resembling root on the host."
  attribution: Kevin Peckham, Principal at Lightning Jar
glossary:
  - term: Pimcore
    definition: A PHP and Symfony digital experience platform (PIM, DAM, CMS, and commerce). Its Community Edition was GPLv3 for years before a 2025 move to the source-available POCL license.
  - term: OpenDXP
    definition: A community-driven, GPLv3 fork of Pimcore Community Edition (v11.5.13), launched in February 2026 to continue the platform's open-source lineage after Pimcore's license change.
  - term: POCL (Pimcore Open Core License)
    definition: The source-available license Pimcore Community Edition moved to from version 2025.1, which requires a paid commercial license above a global annual revenue threshold.
  - term: Rootless Podman
    definition: A container engine that runs containers as an ordinary user rather than root. The container's internal users map to unprivileged host user IDs, so a container breakout does not yield host root.
  - term: SELinux
    definition: A mandatory access control system in the Linux kernel that confines processes to explicitly allowed actions, containing the damage even a privileged process can do.
  - term: Caddy
    definition: A modern web server that obtains and renews TLS certificates automatically via Let's Encrypt, with secure defaults, replacing the manual certificate and virtual-host management of older servers.
additionalReading:
  - title: "Pimcore or OpenDXP: A Fork in the Road for Long-Tenured DXP Stacks"
    url: "/blog/opendxp-pimcore-fork"
  - title: "PetroSkills Sells Complex Training Products With a Bespoke OpenDXP and Vue Commerce Platform"
    url: "/customer-stories/petroskills-ecommerce"
  - title: "The Open-Source B2B Advantage"
    url: "/blog/open-source-b2b-advantage"
---

For more than ten years, [PetroSkills](/customer-stories/petroskills-ecommerce) ran its training and commerce platform on Pimcore Community Edition. In 2025, Pimcore changed the terms underneath that decade of work: the Community Edition moved from GPLv3 to the source-available POCL license, the legacy admin UI was slated for removal, and a paid commercial license became mandatory above a revenue threshold. We wrote about the strategic choice that followed, and why we moved to OpenDXP rather than up the Pimcore mainline, in [Pimcore or OpenDXP: A Fork in the Road](/blog/opendxp-pimcore-fork).

This post is the other half of that story: not why we chose OpenDXP, but how we migrated, and how we used the occasion to modernize the entire server underneath the application. Two migrations happened at once. The platform moved from Pimcore to OpenDXP. The infrastructure moved from an aging server to a fresh, hardened, reproducible stack on RHEL, rootless Podman, and Caddy.

## Two Migrations, One Window

Sequencing mattered. The application itself went Pimcore 10 to Pimcore 11 and then to OpenDXP, which is forked from Pimcore Community Edition 11.5.13 and is architecturally identical to it. Because OpenDXP preserves the Symfony foundation, the data-modeling approach, and the admin-bundle UI the deployment was already built on, the platform move was largely a fork-following exercise (namespace and package-name changes) rather than a rewrite. A decade of custom extensions and operational knowledge carried forward intact.

That platform continuity is exactly what made it safe to be ambitious about the infrastructure. If the application layer is going to behave the same on the other side, you can replace everything below it with confidence. So we did.

## The Bill That Never Comes

Start with the reason the whole project existed, because it's also the clearest win for the client.

Under Pimcore's new POCL license, a Community Edition user crossing a global annual revenue threshold owes a commercial license. For a growing company, that turns a healthy year into an involuntary line item: you succeed, and your open-source CMS mails you an enterprise invoice. It also makes budgeting adversarial, since the trigger is your own revenue.

OpenDXP is GPLv3, in perpetuity, community-governed. Moving to it didn't just avoid a one-time upgrade cost. It removed a standing contingent liability from the client's future. There is no revenue threshold, no metered license, and no single commercial sponsor who can change the terms in the next release. The client stopped being one good year away from a mandatory enterprise contract. For a platform meant to run another decade, that peace of mind is worth as much as any feature.

## Onto RHEL

The application had been living on an older server and an older operating system, the kind of foundation that works fine right up until it quietly becomes a risk: aging packages, security updates that get harder to apply, and a configuration nobody wants to touch because nobody remembers all of it.

We provisioned a fresh Red Hat Enterprise Linux server as the new home: a current, long-support enterprise Linux with a clean, documented setup from the ground up. Starting fresh let us build the whole environment deliberately rather than inheriting years of accreted server state, and it put the platform on an OS with a predictable, long maintenance horizon to match the platform's own.

## The Container as a Security Boundary

The most consequential infrastructure decision was running the application in a **rootless Podman** container rather than directly on the host.

Rootless Podman runs containers as an ordinary, unprivileged user. The users *inside* the container, including the web server's `www-data`, map to unprivileged subordinate user IDs on the host, not to host root. Combined with SELinux running in enforcing mode, this changes the entire calculus of what a compromise means. If an attacker ever breaks the application, they don't land on the host as root, or even as a normally privileged user. They land as a namespaced, unprivileged identity, boxed in by SELinux, with the blast radius contained by design rather than by hope.

That is the difference between a container as convenient packaging and a container as a genuine security boundary. For an e-commerce platform that processes payments and is scanned by hostile bots around the clock, the boundary is the point. The reproducibility is a bonus: the environment is now defined, versioned, and rebuildable, instead of being a hand-tuned server that only exists once.

## Caddy Instead of Apache and Purchased Certificates

The last piece was the web server and TLS, and here the modernization paid for itself in ongoing effort saved.

The old setup was a traditional one: Apache, with a TLS certificate that was purchased, installed by hand, and renewed on a calendar that someone had to remember. The certificate file was even stamped with its year, the kind of detail that quietly becomes a deadline. Every renewal was a small operational risk, and an expired certificate is the kind of self-inflicted outage that takes a site down at the worst possible moment.

We replaced all of it with [Caddy](https://caddyserver.com/). Caddy obtains and renews Let's Encrypt certificates automatically, with no purchased certificates, no renewal calendar, and no manual installation. Its defaults are modern and strict out of the box (TLS 1.3, HSTS, strong ciphers, an A+ configuration with essentially no tuning), where the equivalent Apache setup was a long virtual-host file of hand-maintained directives: HSTS, a full Content-Security-Policy, and a stack of other security headers, all of which you own and must keep correct yourself. In the rootless model, Caddy terminates TLS on `:443` and proxies to the container on an unprivileged high port, so the whole request path fits the security posture. The Caddyfile that expresses all of this is a handful of lines, and most changes to it are one-line edits.

The annual certificate purchase is gone. The renewal chore is gone. The web-server config shrank from a directory of Apache virtual hosts to a short, legible file.

## What the Client Actually Got

Add the pieces up and the migration delivered four things that matter to a business running a platform for the long haul:

1. **No license surprise.** GPLv3 in perpetuity, with no revenue threshold waiting to convert success into a mandatory bill.
2. **A real security boundary.** Rootless Podman plus SELinux means an application compromise is contained to an unprivileged, namespaced identity, not handed host root.
3. **Lower standing cost and risk.** No purchased certificates, no manual renewals, no expiry outages, and a current OS with a long maintenance horizon.
4. **Continuity.** Because OpenDXP is architecturally identical to the Pimcore 11 it forked from, a decade of custom work moved across without re-implementation.

## The Takeaway

A forced migration is an unwelcome expense right up until you realize it's also permission. Pimcore's license change made *some* move mandatory, so we made it the right one: not just off the licensing treadmill and onto GPLv3 OpenDXP, but off an aging server and onto a modern, contained, reproducible stack that is cheaper to run and far harder to compromise.

The platform behaves the same to the people who use it every day. Everything underneath it is new, and the client sleeps better for reasons that range from the legal to the operational. When you have to open the patient up anyway, fix everything you safely can.

The product story that sits on top of this foundation is in our customer story, [PetroSkills Sells Complex Training Products With a Bespoke OpenDXP and Vue Commerce Platform](/customer-stories/petroskills-ecommerce).
