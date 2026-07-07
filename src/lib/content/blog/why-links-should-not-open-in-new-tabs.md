---
title: Please Don’t Force Links to Open in New Tabs
metaTitle: Why Links Should Rarely Open in a New Tab
slug: why-links-should-not-open-in-new-tabs
description: Clients often ask us to force links to open in new tabs. We can, but we strongly advise against it. Here’s why.
date: 2026-02-05
draft: false
tags: [ux, accessibility, web-standards, usability, design]
image: https://lj-01.nyc3.cdn.digitaloceanspaces.com/images/blog/beetle-on-wildflower
imageDescription: A watercolor painting of aslug on a blue wildflower
author: Kevin Peckham
quote:
  text: "Good UX honors user choice. Forcing new tabs is a choice taken away."
  attribution: Kevin Peckham, Principal at Lightning Jar
glossary:
  - term: User Agency
    definition: The user’s control over how they navigate, interact, and accomplish tasks, including when and where to open links.
  - term: Cognitive Load
    definition: The mental effort required to process information and complete tasks. Higher cognitive load increases friction and errors.
  - term: Back Button
    definition: A primary browser affordance that returns users to a previous state; it underpins most people’s mental model for web navigation.
  - term: Screen Reader
    definition: Assistive technology that converts on-screen content into speech or braille output for blind or low-vision users.
  - term: Keyboard Navigation
    definition: Navigating and interacting with interfaces using the keyboard (e.g., Tab, Enter) rather than a mouse or touch.
  - term: Focus Management
    definition: The practice of ensuring keyboard focus moves predictably after an interaction, essential for accessibility.
  - term: Security Context
    definition: The browser’s provenance and trust model (protocol, domain, window/tab relationship) affecting features like referrers and opener access.
additionalReading:
  - title: "Why Open Source Beats Proprietary Platforms for B2B Websites"
    url: "/blog/open-source-b2b-advantage"
  - title: "Why SvelteKit is the Best Choice for Modern B2B Websites"
    url: "/blog/sveltekit-vs-wordpress-b2b"
  - title: "Questions, Decisions & Compromises"
    url: "/blog/questions-decisions-compromises"
sources:
  - title: "Mental Models"
    author: "Megan Chan"
    date: "2024-01-25"
    publication: "NN/g Website"
    url: "https://www.nngroup.com/articles/mental-models/"
  - title: "New Browser Windows and Tabs"
    author: "Nielsen Norman Group"
    date: "2020-09-20"
    publication: "NN/g Website"
    url: "https://www.nngroup.com/articles/new-browser-windows-and-tabs/"
  - title: "G200: Opening new windows and tabs from a link only when necessary"
    author: "W3C Web Accessibility Initiative"
    publication: "WCAG 2.1 Techniques"
    url: "https://www.w3.org/WAI/WCAG21/Techniques/general/G200"
  - title: "ARIA Live Regions"
    author: ""
    publication: "MDN Web Docs"
    url: "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions"
  - title: "Ten Usability Heuristics"
    author: "Jakob Nielsen"
    date: "1994-04-24"
    publication: "NN/g Website"
    url: "https://www.nngroup.com/articles/ten-usability-heuristics/"
  - title: "rel=noopener"
    author: ""
    publication: "MDN Web Docs"
    url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/noopener"
---

We hear this request from clients over and over again: “Can you make the links open in a new tab?” Our answer is usually the same: *Yes, we can. But no, we won't*. Here’s why.

## Respecting User Control

On the web, the default is simple: click a link, go to that page in the same tab. That’s how most people expect navigation to work, and it’s how the [back button](https://www.nngroup.com/articles/mental-models/) remains meaningful. When a site forces a new tab, it overrides user intent and removes a basic choice. Users already have reliable tools to open new tabs when they want to: middle-click, Ctrl+click, long-press on mobile, or a context menu. Assuming we know better than the user often leads to frustration, especially on sites that open almost every link in a new tab and leave people with a clutter they never chose.

## Predictability Beats Fragmentation

Many people don’t have a firm mental model of tabs and windows. When a new tab opens without warning, they may not notice the context switch, and the Back button appears “broken.” Instead of a smooth path back, they’re forced to close a tab or hunt through a crowded tab strip to find the original page. On mobile, where tab interfaces are hidden behind gestures or icons, the switch is even more opaque. [Good UX preserves a coherent history and keeps navigation predictable](https://www.nngroup.com/articles/new-browser-windows-and-tabs/); forced new tabs fragment the experience and make progress feel brittle. For non-HTML documents like PDFs, weigh context carefully; they often disrupt flow and are best avoided for on-screen reading. If you must link a PDF on desktop, calling out the format and potentially opening it separately can sometimes help. 

## Accessibility Matters

Opening links in new tabs is a documented accessibility anti-pattern. Screen reader users often receive no clear announcement that a new tab opened; they just notice Back doesn’t behave as expected. Keyboard users can be transported to a different context without warning, losing their place in the focus order. Cognitive load increases as people manage more browser state: multiple tabs, separated histories, and inconsistent focus. If you truly must open something in a new tab, you should communicate it in visible text and accessible labels (“opens in a new tab”) and manage focus accordingly. [WCAG techniques](https://www.w3.org/WAI/WCAG21/Techniques/general/G200) advise limiting new windows and, when used, informing users in link text; assistive tech can announce changes using [live regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions) where appropriate. That’s mitigation, not justification.

## Clutter, Performance, and Trust

Every forced new tab contributes to tab overload. Important pages get buried among windows the site spawned, and the cleanup tax is shifted onto the user. On lower-end devices, excess tabs can degrade performance and battery life. From a trust perspective, coercive navigation reads as a dark pattern: “We don’t want you to leave” becomes “We don’t trust our own value.” If your content is useful, people return; retention comes from relevance and clarity, not traps. Evidence-based UX guidance recommends defaulting to same-tab navigation, clearly labeling special cases, and avoiding PDFs for on-screen reading where possible.

## Weak Justifications and Better Patterns

Teams often cite three reasons for `target="_blank"`. None require it.

### “We don’t want people to leave our site.”
If the experience is strong, they’ll come back. Focus on clear way-finding, internal linking, and good information architecture. [Jakob Nielsen’s](https://www.nngroup.com/articles/ten-usability-heuristics/) emphasize user control and freedom; preserve predictable navigation and let users decide how to open links. 

### “We don’t want users to lose their place in a form.*  
Preserve state instead: autosave drafts, warn before navigation, or surface help inline via a well-built dialog or side panel. Use accessible status messages or [live regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions) to confirm autosave without stealing focus. 

### “It’s an external link.”*  
Externality alone isn’t a valid reason. Use a small icon or label to set expectations and let users decide whether to branch their workflow. Accessibility checklists recommend indicating when links open new windows and when linking to non-HTML files, but not forcing tabs by default.

## When a New Tab Is Reasonable

There are narrow cases where a new tab can help, but treat them as exceptions and say so explicitly. Large downloads or file types that can hijack the viewport, like PDFs, may deserve a separate tab. In these cases, make the file type and size clear and indicate that it opens in a new tab. Long-running or comparison tasks can justify an explicit “Open in new tab” control, because the user is choosing parallel work. Rarely, after a long and fragile form, you might protect progress with a new tab, but better is to make the form resilient. In any exception, add `rel="noopener noreferrer"` alongside `target="_blank"` and announce the behavior in accessible text. `rel="noopener"` prevents the new page from accessing `window.opener`, mitigating tabnabbing; `noreferrer` also removes the Referer header. [Source: MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/noopener)

## Practical Guidance

Default to same-tab navigation. Write link text that sets clear expectations for destination and content type. Preserve state in forms rather than outsourcing safety to browser tabs. If you do open a new tab, make it visible, make it accessible, and make it rare. You’ll respect user agency, keep history coherent, reduce confusion and cognitive load, and build more trust with the people you serve.

## Wrapping Up

We can make links open in new tabs. Most of the time, we shouldn’t. Honor the Back button. Honor attention. Honor choice. When in doubt, let users decide how they want to browse. That is good UX, and it usually leads to better business outcomes too.
