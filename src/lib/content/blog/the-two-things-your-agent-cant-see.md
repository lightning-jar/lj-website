---
title: "The Two Things Your Agent Can't See: Memos and Mentioned Nodes"
metaTitle: "The Two Things Your Agent Can't See | barkup-bench Studies T and U"
slug: the-two-things-your-agent-cant-see
description: "Studies T and U, the twentieth and twenty-first in our pre-registered benchmark series, mapped the two blind spots of a stateless LLM document editor. Study T: requests that depend on earlier conversation fail 100% of the time by construction, and an app-maintained memo (three note lines per session) fixes every one at 2% extra cost. Study U: edits that must read a second node against a target-only view never error; they silently invent plausible values, 90 out of 90 times. Putting every mentioned node in the view fixes all 90 at 25 times less input than the whole tree. The model doesn't need memory or the full document. It needs your application to take notes and open the right pages."
date: 2026-07-10T22:00:00Z
draft: false
tags: [ai, agents, llm, open-source, barkup, benchmarks]
image: https://lj-01.nyc3.cdn.digitaloceanspaces.com/images/blog/girl-talking-to-goose.webp
imageDescription: A vintage-style illustration of a young girl in a red pinafore dress leaning forward to talk face to face with a large white goose, on a cream background
author: Kevin Peckham
quote:
  text: The failures were never refusals. They were confident, valid, plausible fiction. That is what makes them dangerous, and what makes the fixes worth three note lines and one array entry.
  attribution: Kevin Peckham, Principal at Lightning Jar
glossary:
  - term: Callback request
    definition: "An edit request whose needed fact lives only in earlier conversation, such as \"rename it to the codename we settled on\", where the codename was stated three requests ago and never written into the document."
  - term: Session-notes memo
    definition: A short application-maintained block appended to each editing turn, recording facts and standing rules the user has declared. A memo instead of a transcript.
  - term: Dependent edit
    definition: "An edit whose correct value must be read from a second node in the same document, such as \"set this image's caption to match that section's title\"."
  - term: Silent invention
    definition: "The failure mode Study U measured: asked for a value it cannot see, the model returns a valid, plausible, applicable patch containing a made-up value, with no refusal and no error."
  - term: Focus ids
    definition: The list of node ids a focused view renders in full. Study U's rule is that this list must include every node the request mentions, not just the node being edited.
additionalReading:
  - title: "The Thirty-Sixth Edit: Long LLM Sessions Don't Need Memory Either"
    url: "/blog/the-thirty-sixth-edit"
  - title: "Your Agent Doesn't Need a Memory: Two Worked Examples Replace Session History"
    url: "/blog/two-examples-replace-a-memory"
  - title: "The Model Doesn't Need to See Your Tree"
    url: "/blog/the-model-doesnt-need-to-see-your-tree"
  - title: "Stable IDs Are All You Need: Seven Studies on Letting LLMs Edit Trees"
    url: "/blog/stable-ids-are-all-you-need"
  - title: "barkup-bench research dashboard"
    url: "/research/barkup-bench"
  - title: "barkup-bench on GitHub: pre-registration, corpus, and raw analysis"
    url: "https://github.com/kevinpeckham/barkup-bench"
---

[barkup-bench](/research/barkup-bench) is our open, pre-registered benchmark series on how LLM agents should edit structured documents: page layouts, templates, CMS content. Twenty-one studies in, the working recipe had become remarkably light: give every node a stable id, edit by small anchored patches, show the model a focused view instead of the whole document, and run sessions with no memory at all, just two worked examples in the system prompt. Study S measured that recipe through 36-edit sessions and nothing broke.

Which made us suspicious. A recipe that light has to be leaning on an assumption somewhere, and we found two: every request we had ever tested was self-contained, and every request could be executed without reading any node the view did not show. Real users break both assumptions constantly. So Studies T and U built the two missing classes of request on purpose, predicted the stateless recipe would fail them by construction, and measured the cheapest possible fixes. Both studies passed their pre-registered gates, and together they complete the map of what an LLM document editor actually needs handed to it.

## Study T: you had to be there

Picture the stateless editor as a very good temp worker who starts fresh every single morning: perfect technique, no memory of yesterday. Now the user says "rename that section to the campaign codename we settled on." The codename was settled three requests ago, out loud, and never written into the document. The temp was not there. No amount of skill fixes not having been in the room.

Study T built editing sessions with exactly these requests: a codename declared in one instruction and demanded four steps later, and a standing rule ("from now on, every new text block gets the small-caps style") that later inserts had to apply without being reminded. Corpus validation guaranteed the needed fact appeared nowhere in the document, so it lived only in the conversation.

The result was the cleanest dissociation in the series. The stateless recipe failed every single one of the 160 callback steps, on both models, while scoring a perfect 160 of 160 on the ordinary steps of the very same sessions. Nothing about its editing skill degraded. It simply cannot recall a conversation it never saw.

The fix is not bringing the transcript back. It is a memo. The application records each declared fact as it arrives and appends the running list to every request:

```
Session notes (maintained by the application):
- The campaign codename is "vesper-7".
- Standing rule: every new text atom gets textStyle "small-caps".
```

Three note lines. That memo recovered all 160 callback steps on both models, matched full conversation history on every statistical comparison, actually beat it on end-to-end document integrity, and cost 2% more than stateless, against history's 110% more. Your application takes notes; the model does not need to remember anything.

## Study U: copying a painting it cannot see

Now the document-side twin. Focused views work because most edits only concern one small region. But some requests reach across the document: "set this image's caption to match that section's title." To execute that, the model must read the section's title. If the view shows only the image, we have asked it to copy a painting it cannot see.

Here is what we expected: refusals, questions, maybe broken patches. Here is what happened instead, in all 90 such cells across both models: a valid, well-formed, plausible patch containing a value the model simply made up. Not one refusal. Not one clarifying hesitation. Not one malformed artifact. Asked to copy something invisible, both models confidently wrote fiction that validated and applied. In a production system nothing would ever look wrong.

The fix costs one array entry. A focused view already accepts a list of node ids to render in full; the rule is that the list must include every node the request mentions, not just the node being edited. With both nodes in the view, the score went from 0 of 90 to 90 of 90, at about 1.7k input tokens per edit, which is 25 times less than pasting the whole document, and it was actually more accurate than the whole document, which fumbled three of the cross-references at a thousand nodes.

We also tested whether the model could look the value up itself with the search tool we shipped in barkup 0.4. It can, mostly: 82 to 84%, at a median of two to three search calls. That is a real capability and real progress, but it is measurably short of the perfect score the one-line view fix delivers. The clean division of labor: the model may search to find where to edit; your application supplies what it must read.

## What this means for builders

Both failures share a signature that should worry anyone shipping an LLM document editor: they are silent. The callback failure writes the wrong name without complaint. The dependent-edit failure invents a caption without complaint. Every bad patch in both studies was valid, plausible, and applied cleanly. You will not find these bugs in your error logs, because they do not produce errors.

And both fixes are nearly free, because both are the same idea: the model is a brilliant executor with no context of its own, so the application must hand it everything the request assumes. Said in the conversation? Put it in a memo. Referenced in the document? Put it in the view. Concretely:

- **Maintain a session-notes memo.** When the user declares a fact or a standing rule, record it as a bullet line and append the list to every editing request. Measured: restores 100% of conversation-dependent requests at 1.02 times stateless cost.
- **Focus the view on every mentioned node.** Before rendering, collect the ids of every node the request refers to, the edit target and everything it must read, and pass them all as focus ids. Measured: 90 of 90 at 25 times less input than the full document.
- **Do not rely on search for reads.** Search grounds targets at oracle level. Reading values through search alone leaves a measurable gap, and the failure when it misses is a silent guess.

The usual caveats travel with the numbers: two models, generated corpora, one pre-registered series behind it all. Both briefs were committed before their first scored runs, and both no-leakage guarantees are unit-tested: the needed fact was verifiably absent from the document in Study T and verifiably invisible to the narrow view in Study U. Everything is reproducible from the [benchmark repo](https://github.com/kevinpeckham/barkup-bench), and the full chart set lives on the [research dashboard](/research/barkup-bench). If you find the request class that breaks the memo or the view contract, we want the issue.

Update, the next day: we asked whether these two fixes survive qualitative goals ("rewrite this paragraph to focus on our central thesis"), which meant our first judge-graded study, with the judge passing its own pre-registered exam (50 for 50, both judges) before grading anything. The split is the finding. The memo carries a goal at full parity with an explicit instruction, so Study T's fix generalizes completely. But the view fix does not: models shown the document node where the goal lived read it, wrote on-topic prose, and still lost 117 of 120 judged comparisons to being told the goal outright. The refined rule: views carry values, memos carry goals. The full story is in [Views Carry Values, Memos Carry Goals](/blog/views-carry-values-memos-carry-goals).
