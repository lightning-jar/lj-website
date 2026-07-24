# AI Writing Tells

A working list of "AI slop" giveaways in prose, kept so we can scan our own
blog articles before publishing. Compiled July 2026 from published marketer
checklists of AI-content tells, common LLM stylistic tics, and our own house
rules. The irony that much of our drafting is AI-assisted is the point: the
assistance should never be detectable as a style.

Patterns here are FLAGS FOR REVIEW, not automatic violations. Quoted text,
code blocks, cited titles, and deliberate rhetoric can all hit a pattern
legitimately. The scan finds candidates; a human makes the call.

## 1. Banned by house style (fix on sight)

- Em dashes and en dashes in prose. Replace with colon, comma, parentheses,
  or a period. (Now also a widely published AI tell, which we banned first.)
- "Sit with that" / "worth sitting with" and other reflective-pause tics.
- Clever sentence fragments where a plain sentence would do.

## 2. Vocabulary tells (marketing-brochure words LLMs overuse)

delve, seamless, robust (as filler praise), leverage (as a verb),
cutting-edge, game-changer / game-changing, revolutionize, supercharge,
elevate (your), unlock (the/your), harness the power of, streamline,
boasts (features), treasure trove, tapestry, vibrant, bustling,
meticulous(ly), ever-evolving, fast-paced, digital age, realm,
landscape (metaphorical), ecosystem (as filler), a testament to,
plays a pivotal/crucial role, embark on a journey.

## 3. Phrase and construction tells

- "It's important to note" / "It's worth noting"
- "In today's ..." openers
- "In conclusion" / "At the end of the day" / "Ultimately," as a closer
- "Whether you're a X or a Y" audience-flattering constructions
- "Look no further"
- "Deep dive" / "dive into" (especially in headings)
- "Moreover" / "Furthermore" chains
- "Not just X, but Y" and "isn't just X; it's Y" pivots (fine occasionally,
  an AI tell in density)
- "The elephant in the room" / "a double-edged sword" and other stock idioms
- "In the world of ..." scene-setting openers

## 4. Structural tells (no grep pattern; review by eye)

- Rule-of-three overload: triads in every sentence and list.
- Anaphora beyond deliberate rhetoric (three-plus consecutive sentences with
  the same opener).
- Bullet lists where every item is a bolded lead-in plus colon, uniformly.
- Uniform paragraph lengths producing a metronome rhythm.
- Rhetorical questions as section transitions ("So what does this mean?").
- Hedging stacks ("arguably", "in many ways", "to some extent" clustering).
- Benefit claims generic enough to apply to any product in the category.
- Perfectly parallel section structures across an entire article.

## Running the scan

From the repo root, over the frozen corpus fixtures (pre-migration posts)
or any exported markdown:

```sh
grep -nEi -f docs/ai-writing-tells.grep tests/fixtures/blog-corpus/*.md
```

The companion pattern file `docs/ai-writing-tells.grep` holds the greppable
subset (sections 1-3). Current-era posts live in the replicator CMS; export
their markdown (article_get via the replicator MCP) to files first, then run
the same grep. Review every hit in context before editing anything.

Known-noisy patterns (from the July 2026 full-corpus scan): `robust` mostly
hits the legitimate engineering sense on this blog and `not just` casts a
wide net on purpose; both need human triage every run. The fixture corpus is
FROZEN test data; when a scan finds a tell in a fixture, the fix target is
the live CMS article, never the fixture file.
