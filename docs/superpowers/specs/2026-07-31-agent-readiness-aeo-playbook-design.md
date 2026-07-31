# The Agent-Readiness & AEO Playbook — Design Spec

**Date:** 2026-07-31
**Repo:** `lj-website` (branch `production`)
**Status:** Design, pending user approval before implementation plan

## Goal

Publish a single evidence-grounded guidance page, a sibling to the Builder's
Playbook (`/research/barkup-bench/playbook`), that turns the four AEO Bench
studies into a positive "do this" playbook for making websites and agents
work well together. It summarizes the existing industry recommendations
(Cloudflare's agent-readiness post first, plus the named specs it builds on),
and pairs each with what our studies confirmed, corrected, or overturned.

## Non-goals

- Not a claim-by-claim scorecard of the vendor advice (rejected in favor of a
  positive playbook; the claims appear inside each guideline as the framing we
  corrected).
- Not a rewrite or restructure of the AEO Bench dashboard or study pages.
- No new data files or JSON schema; content is authored inline in the Svelte
  page, exactly as the Builder's Playbook does.

## Title, URL, placement

- **Title:** "The Agent-Readiness & AEO Playbook"
- **URL:** `/research/aeo-bench/playbook` (parallels the sibling)
- **Route files:** `src/routes/research/aeo-bench/playbook/+page.server.ts`
  (meta) and `.../+page.svelte` (content + template).

## Editorial stance (applies throughout)

This discipline is not yet a precise science. Many techniques are speculative:
guesses at standards that have not settled and at behaviors models may or may
not adopt. The page says so up front, and every guideline is tagged so a
measured finding is never confused with a hopeful one. Anyone who claims
certainty about what works today and will keep working tomorrow is overselling.

House style: no em or en dashes in prose; plain phrasing; scan the finished
copy against `docs/ai-writing-tells.md` before publishing.

## Sources cited

- **Cloudflare, "Agent readiness"** (`https://blog.cloudflare.com/agent-readiness/`)
  — the anchor all four studies test; cited heavily and generously.
- **The llms.txt proposal** (`https://llmstxt.org`).
- **sitemap.xml** (`https://www.sitemaps.org`) and **robots.txt**.
- **MCP server cards / `.well-known`** (Model Context Protocol spec).
- **schema.org** structured data (only where relevant; not a measured lever).
- **Google Search, "Using AI-generated content"**
  (`https://developers.google.com/search/docs/fundamentals/using-gen-ai-content`)
  — the different-angle source: Google judges content by utility and
  authenticity, not production method, and deliberately declines to prescribe
  a technique checklist. Convergent with our substance-over-tricks finding.
- **AEO Bench studies 1–4** as the evidence base (2,808 scored runs, 6 models).

No third-party studies or statistics are invented. Where our evidence stops,
the item is tagged a candidate for future study rather than asserted.

## Visual system

Reuse the Builder's Playbook classes verbatim so the two pages read as one
series: `eyebrowCls`, `proseCls`, `linkCls`, `codeCls`, the `display` heading,
`page-x-padding main-y-padding` main grid, and the yellow left-border
"evidence" line. Same `{@html}` prose paragraphs, same optional `<pre>` example
blocks with captions.

## Data shape (inline typed array)

Extends the sibling's `Play` shape with two tags that keep measurement honest:

```ts
interface Guideline {
	id: string;
	part: "site" | "agent";     // which of the two parts it belongs to
	eyebrow: string;             // "01 · If you own a website · Study 2"
	title: string;
	prose: string[];             // paragraphs; inline html allowed
	example?: string;            // rendered verbatim in a <pre>
	exampleCaption?: string;
	verdict: "Confirmed" | "Confirmed, overstated" | "Overturned"
		| "Convergent" ;          // our relationship to the prevailing advice
	confidence: "Measured" | "Measured today; future-study candidate"
		| "Not our measurement";  // epistemic tag
	evidence: string;            // the numbers + chart/study links (inline html)
}
```

The template renders `verdict` and `confidence` as small labels near the
title, and `evidence` as the yellow-border line (mirrors the sibling's
"Measured" line).

## Page structure and content

### Header + humility caveat

Distilled-from line uses `research-stats.json` (`aeoBench`: four studies,
2,808 scored runs, six models). One paragraph on the division of labor the
studies keep finding: sites should publish and link; the effective lever lives
in the agent's harness, not the website. One paragraph on the stance above.

### Part One — If you own a website

**01 · Link the content you want agents to reach.**
Verdict: Overturned. Confidence: Measured.
Discovery files will not surface unlinked content; navigation will. On a
300-page site engineered so orphan pages (recalls, safety bulletins) were
reachable only through discovery files, every model scored 0/10 on them in
every file-bearing arm. Worse, unreachable content is not merely unfound:
agents authoritatively declared it nonexistent 148 of 150 times through a
structured answer channel. If content matters, link it. (Study 2)

**02 · Serve markdown: content negotiation plus `.md` fallbacks.**
Verdict: Confirmed, overstated. Confidence: Measured.
Cloudflare's up-to-80% token-savings claim is real but proportional to how
wasteful the agent was to begin with: a chatty model (gemini) fell to about
26 to 27% of its baseline input cost (roughly 74% saved), a frugal one (opus)
only to 80 to 83% (about 20% saved). Zero measured downside. Worth shipping if
your traffic includes chatty agents. One honest caveat: unprompted markdown
adoption is a model disposition, not a given (opus discovered it 64% of the
time, sonnet essentially never). (Study 1)

**03 · Publish `llms.txt` and `sitemap.xml`, but expect nothing from them
today.**
Verdict: Overturned. Confidence: Measured today; future-study candidate.
Across 900 agent runs no model fetched either file even once; across a further
128 chances per model on the site built to need them, consultation was near
zero (opus 0, sonnet 1). Not harmful, just unread at the model layer. Keep
them for the crawler and product layers. This is the item most likely to
change as agent harnesses adopt discovery, which is exactly why it is a
registered candidate for future study, not a permanent verdict. (Studies 1–2)

**04 · Write for substance, not tricks.**
Verdict: Convergent. Confidence: Not our measurement.
Google judges content by utility and authenticity, not by how it was produced,
and pointedly declines to publish an optimization checklist. That lines up with
what we measured: no retrieval aid improved correctness on a navigable site,
because finding facts was never the bottleneck. There is no tactic that beats
being genuinely useful and reachable. (Google Search guidance; convergent with
Study 1's saturation result.)

### Part Two — If you build the agent

**05 · Tell your fetch tool the index exists (the one-sentence affordance).**
Verdict: Confirmed. Confidence: Measured.
The cheapest capability upgrade the series measured. Adding a single sentence
to the fetch tool's description (machine-readable indexes may exist) took
orphan-task success from 0/10 to 10/10 on the frontier tier and collapsed
blind URL path-guessing (one model went from 43 guesses to zero). The value of
llms.txt is real; its discovery is the missing link, and it lives in the
harness. (Study 2)

Example block: the affordance sentence, verbatim.

**06 · Prefetch a curated site index into context.**
Verdict: Confirmed. Confidence: Measured.
The series' first pre-registered gate PASS. Prefetching a curated index into
the system context beat every alternative on cost: on Haiku 4.5, input tokens
per solved task fell from 68.9k unaided to 41.3k under the hint, 13.5k with a
dedicated index tool, and 9.4k with the curated prefetch, at equal or better
accuracy. It also rides the cacheable system prompt, where a tool call cannot.
This site's own concierge ships exactly this design. (Study 3)

Example block: the cached-system-prompt layout (static index block under a
single cache breakpoint, per-request tail after it).

**07 · Mount capabilities as tools; do not just advertise them.**
Verdict: Confirmed. Confidence: Measured.
Knowing an endpoint exists changes nothing; holding it changes everything. With
full knowledge of both a page and a structured API, every model still answered
every product question from pages (0 of 24 via the API), reserving structured
calls for orders it could get no other way. Only mounting the endpoints as
harness tools changed the habit, and it made the whole surface cheaper: Haiku's
mean input per cell fell from 51.4k to 9.5k, a 5.4x cut. (Study 4)

**08 · Serve a curated slice, not the everything-file.**
Verdict: Confirmed. Confidence: Measured.
The oversized-index worry is a token tax, not a behavior failure. With
prefetch, consultation is total by construction, and the giant everything-index
bought nothing (zero orphan delta) while costing 2.68x the curated slice's
input. Keep the full file public for crawlers; serve the agent a curated
slice. (Study 3)

### Footer

The thesis in one line ("publish the files, mount the readers"), then
`LinkButton`s to the AEO Bench dashboard (`/research/aeo-bench`) and the
`aeo-bench` repo, plus inline links to the anchor essays: "Nobody Reads
llms.txt (Yet)" (`/blog/nobody-reads-llms-txt`) and "One Sentence Beats Every
File" (`/blog/one-sentence-beats-every-file`).

## Meta (`+page.server.ts`)

Mirror the sibling's `load()` returning `meta` with `title`, a one-paragraph
`description` summarizing the eight guidelines, `robotsFollow: true`,
`analyticsOn: true`.

## Wiring (parallels the Builder's Playbook exactly)

Add the new playbook to the same surfaces its sibling touches:

1. **AEO dashboard tout** — a CTA card on `src/routes/research/aeo-bench/+page.svelte`
   modeled on the barkup dashboard's "Read the Playbook" tout.
2. **`src/routes/llms.txt/+server.ts`** — one list entry.
3. **`src/routes/sitemap/+page.server.ts`** — human sitemap entry.
4. **`src/routes/sitemap.xml/+server.ts`** — XML entry (priority ~0.25, weekly).
5. **`src/lib/server/siteIndex.ts`** — extend the research line so the concierge
   index names both playbooks.
6. **`src/routes/mcp/+server.ts` / `src/lib/server/agentTools.ts`** — where the
   barkup playbook URL appears, add the AEO one alongside it.

## Testing

- `bun run check` (types) — must stay at 0 errors.
- `bun test` — full suite stays green; no fixture hashes are touched (this is a
  new static route, no markdown-corpus change).
- `bunx biome check --write` on touched files.
- Scan finished prose against `docs/ai-writing-tells.md` (no em/en dashes).
- Optional: a light route-render smoke assertion if it adds value; not required
  for a static content page.

## Open questions

None blocking. Guideline set and split approved in brainstorming; title chosen.
The spec-review gate is the place to add, cut, or reorder guidelines (for
example, whether to add a distinct schema.org / structured-data guideline, or
merge 06 and 08).
