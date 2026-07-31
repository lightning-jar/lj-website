# The Concierge chat

A visitor-facing chat agent at [`/concierge`](https://www.lightningjar.com/concierge)
that answers questions about the studio's work, research, packages, and
writing — grounded entirely in this site's own content, and doubling as
a live demonstration of the agent-facing surfaces we advertise to other
agents.

It is a **prototype**, deliberately kept small, defensively hardened, and
fail-closed. It is surfaced (footer link, nav "More" menu, both sitemaps)
as a pre-homepage soft launch — partly to see how the abuse defenses hold
up under real bot/crawler traffic before any homepage decision.

Almost every design choice traces to a measured result from our own
research — [AEO Bench](https://github.com/kevinpeckham/aeo-bench) Studies
1–3 and the barkup-bench prompt-caching work. Those citations are called
out inline throughout.

---

## What it is (and is not)

- **Read-only and grounded.** Every answer comes from tool results or the
  facts in the system prompt. It has no write tools, holds no secrets,
  and takes no actions. The worst a successful prompt injection achieves
  is making it say something off-brand — a screenshot risk, not a data or
  action risk.
- **Cheap and fast.** `anthropic/claude-haiku-4.5` through the Vercel AI
  Gateway, temperature 0.3, capped at 800 output tokens and 6 tool steps.
- **Public and keyless.** No login. That is exactly why it carries the
  abuse hardening a logged-in tool (like Replicator's editor chat) never
  needs — see [Security & abuse hardening](#security--abuse-hardening).

---

## Architecture at a glance

```
Browser (/concierge)
  └─ ConciergeChat.svelte  ── @ai-sdk/svelte Chat + DefaultChatTransport
        │  POST /api/concierge   (streaming UI-message protocol)
        ▼
  src/routes/api/concierge/+server.ts
        │  fences → streamText(Haiku via gateway) → toUIMessageStreamResponse
        │
        ├─ system prompt = SYSTEM + curated Site index  (cached static block)
        ├─ tools ──────────────┐
        │                       ▼
        │            src/lib/server/agentTools.ts   ← shared tool layer
        │            src/lib/server/siteIndex.ts     ← curated index (Study 3)
        │
        └─ onFinish → shipLog → replicator /api/chat-log-ingest  (PII-scrubbed)
```

The **same tool layer** (`$lib/server/agentTools.ts`) backs both the
concierge and the public MCP server (`/mcp`). One data layer, two
consumers, so the in-page chat is a live demo of the exact surface
external agents get, and the two can never drift.

### File map

| File | Role |
|------|------|
| `src/routes/concierge/+page.svelte` / `+page.server.ts` | The page (indexable; loads the component) |
| `src/lib/components/ConciergeChat.svelte` | Client: lazy hydration, streaming UI, clear button, markdown-lite renderer |
| `src/routes/api/concierge/+server.ts` | Server: fences, system prompt, tools, streaming, logging |
| `src/lib/server/agentTools.ts` | Shared read-only tool layer (concierge + `/mcp`) |
| `src/lib/server/siteIndex.ts` | Pure `buildSiteIndex()` — the curated prefetched index |
| `tests/conciergeSiteIndex.test.ts` | Index determinism, size bound, cache-safety, header count |
| `replicator/src/routes/api/chat-log-ingest/+server.ts` | The log sink (in the Replicator repo) |

---

## The retrieval harness — what the research changed

The interesting part of this agent is not the chat loop (that is the
standard AI-SDK-on-SvelteKit pattern) but the **retrieval design**, which
is measured end to end in AEO Bench.

### Study 1 — markdown negotiation (token economics)

> *"Nobody reads llms.txt: the aids don't change what agents find; one
> changes what it costs."* Markdown negotiation saved **20–74%** of the
> tokens HTML costs an agent (proportional to how wasteful the agent was
> to begin with), with zero measured downside.

Applied here:

- `read_blog_article` and `read_customer_story` return the **raw markdown
  body**, not rendered HTML. We publish barkdown, a markdown codec —
  there was no reason to feed our own agent HTML.
- `read_page` sends `Accept: text/markdown` first and returns the
  markdown body when the page negotiates it, falling back to HTML
  stripping otherwise. The site serves markdown for article routes via
  `hooks.server.ts`; overview pages that don't negotiate simply use the
  fallback.

### Study 2 — unreachable content is declared nonexistent

> On a weakly-linked ~300-page fixture with orphan pages, models scored
> **0 for 200** on orphan tasks in every discovery-file arm, and
> unreachable content ended with an explicit "not on this site"
> declaration **148 of 150** times. *"Content your navigation cannot
> reach is not just unfound, it is authoritatively declared
> nonexistent."*

Applied here: the concierge's tools originally covered only blog,
stories, reading list, technologies, and packages — leaving the studio's
own overview pages (`/services`, `/about`, `/terms`, `/fun`,
`/built-with`, `/testimonials`) unreachable. Per Study 2, the agent would
have **confidently denied they exist**. The `read_page` tool
(enum-constrained to those routes, no arbitrary fetch) closes that gap.

### Study 3 — the curated index, prefetched into context

> *"The affordance study."* Prefetching a curated site index into the
> system context beat the tool round-trip **9.4k vs 13.5k** input tokens
> per solved task on Haiku 4.5, beat hint-style discovery **4.4×**
> (41.3k) and the unaided baseline **7.3×** (68.9k), at equal-or-better
> accuracy. The everything-index cost **2.68×** the curated slice for
> zero added accuracy — so the guidance for a site with a large index
> (ours is ~150 entries) is: **serve the agent a curated slice in
> context; keep the full file for whoever else arrives.**

Applied here (`src/lib/server/siteIndex.ts`, `buildSiteIndex()`):

- A compact (~1.5k token) plain-text index appended to the system prompt
  under a `Site index:` header. It carries the site's **sections** with
  root-relative paths, **every study** across both series as slug +
  one-line title (with the exact total stated in the header so the model
  reports the real count instead of estimating), the **package** names,
  the `read_page` overview pages, and **pointers** to `search_content`
  for the long blog/reading-list collections — deliberately *not* an
  inline dump of every entry (that is the 2.68× everything-index trap).
- Built **once per server process** via a memoized `siteIndex(fetch)`
  (counts fetched from the CMS on first call), so the bytes are
  byte-stable — a hard requirement for the prompt-cache breakpoint below.

**Making the index authoritative.** An early version left the index as
mere context: the model treated it as supplementary and still called
`list_studies` / `list_packages` on every turn, pure duplication against
the cached prefix. Two changes fixed that:

1. **Removed `list_studies` and `list_packages`** from the concierge's
   tools (they remain on `/mcp` for external agents). Their data already
   lives in the index.
2. **The grounding rule now states the index is authoritative** for
   what-exists / where-is questions, while keeping the anti-lazy-refusal
   fence fully intact on the *negative* path (see below).

Result, verified on dev: "how many studies have you published?" now
answers **with zero tool calls** and the correct count; "what studies
about llms.txt?" makes zero *list* calls; the negative probe still
searches before declining.

---

## Prompt caching (barkup-bench / replicator pattern)

The system prompt is sent in the AI SDK's **system-array** form as a
single static block carrying `providerOptions.anthropic.cacheControl:
{ type: "ephemeral" }`:

```ts
const system: SystemModelMessage[] = [{
  role: "system",
  content: `${SYSTEM}\n\nSite index:\n${index}`,
  providerOptions: { anthropic: { cacheControl: { type: "ephemeral" } } },
}];
```

The concierge has **no per-request system content**, so the whole block
is static and Anthropic reads it back at ~10% of base input cost on every
turn after the first (ephemeral 5-minute TTL). This is the layout the
barkup-bench handoff verified by probe against the AI Gateway: a
*message-level* `cacheControl` on the static block places the breakpoint
at the static/dynamic seam; the call-level variant breakpoints at the end
of the prompt and produces zero reads for chat (a new user message every
turn). Nothing per-request may enter the static block — the
`buildSiteIndex` byte-stability test guards against regressions.

Tool definitions are already static and are left as-is.

---

## Model choice — Haiku 4.5

The concierge is a **heavily tool-dependent agent**: every answer needs a
tool or the index. So the axis that matters most, from Study 2, is
**tool/protocol reliability**, not markdown-negotiation disposition
(which is moot for us anyway — we hand the model markdown directly). The
AEO matrix informs the choice:

- **gpt-oss-120b** collapses on tool protocols (144 no-submits in Study
  2) — disqualified for a tool-first agent.
- **opus-4.8** is the best tool-follower and quality ceiling, but ~10–15×
  Haiku's cost — a large blast-radius multiplier on a public,
  abuse-exposed endpoint. Reserve for after abuse is hardened (Redis +
  BotID) and only if Haiku's quality proves wanting.
- **kimi-k3** is a cheap, protocol-solid A/B candidate; its weakness
  (unprompted markdown negotiation) no longer applies here.
- **Haiku 4.5** (current): cheap (abuse-resilient), a reliable
  tool-follower, and clean grounded behavior in live tests. The research
  argues *against* up-tiering for a public concierge.

---

## Security & abuse hardening

The endpoint is public, so it carries a defense-in-depth stack. Every
layer is a *fence*, not the wall — the AI Gateway credit cap is the hard
backstop.

- **Fail-closed.** No `AI_GATEWAY_API_KEY` → 503 with an in-voice message
  ("the lightning jar is recharging"). The site never depends on this
  route.
- **Origin gate.** Requires a known `Origin` header. The header is set by
  the browser and unforgeable from page JavaScript, so this blocks
  cross-site calls and naive scripts/scrapers (a determined script can
  spoof it — hence "fence, not wall").
- **Rate limits.** Per-IP fixed window (10 / 5 min) and daily cap
  (400 / UTC day) via the shared limiter (`$lib/server/rateLimit`, also
  used by `/mcp` at 60 / 5 min + 2,000 / day). Upstash-backed when
  `KV_REST_API_URL`/`KV_REST_API_TOKEN` are configured, so counters are
  shared across serverless instances; without them (local dev, tests,
  or an Upstash outage) it falls back to in-memory per-instance
  counters — a fence either way. Blocked requests return 429 with a
  `Retry-After` header; `/mcp` additionally answers with a JSON-RPC
  error body so protocol clients back off cleanly.
- **Size caps.** ≤12 user turns, ≤2k chars per text part, ≤40 total
  messages, ≤24k total chars, ≤800 output tokens, ≤6 tool steps. Bounds
  the cost of any single request, including forged assistant history.
- **Message scrubbing.** Incoming messages are stripped to user/assistant
  **text parts only**, with control characters removed — a hostile client
  cannot inject file parts, fabricated tool results, or oversized
  structures. (Forged assistant *text* is still possible but low-stakes;
  the grounding prompt re-asserts each turn and tool results are stripped
  from history.)
- **Tool results are data, not instructions** — stated in the system
  prompt; page content that tries to redirect behavior is ignored.
- **XSS-safe rendering.** The client renders the model's markdown through
  an escape-first whitelist renderer (`renderMarkdownLite`): all HTML is
  escaped, then a small vocabulary (bold, italic, inline code, lists,
  paragraphs, links) is re-introduced from the function's own templates
  over escaped or already-stashed content. Link destinations are
  restricted to single-slash root paths or explicit `https://` URLs, with
  quotes and backslashes excluded so a crafted destination can't break
  out of the `href` or smuggle a protocol-relative off-site link. No
  model-generated HTML ever reaches the DOM. (`@superagent-ai/ai-sdk`'s
  guardrails were evaluated and declined — wrong threat model for a
  no-secrets read-only agent, plus an external dependency and
  data-sharing.)

**Deferred to homepage promotion:** **BotID** (Vercel proof-of-work) —
the proper defense against a spoofing bot, which the CCRTA maps work
proved handles this adversary class. (Redis-backed counters, once on
this list, shipped early: see Rate limits above.) A client-side gesture
gate was considered and rejected as a security control (forgeable
outside a browser); the lazy hydration below is the UX-and-cost version
of that idea.

---

## The client component

`ConciergeChat.svelte` (`$components`) — built on `@ai-sdk/svelte`'s
`Chat` + `DefaultChatTransport`.

- **Lazy hydration.** The AI SDK (~474 KB) is not imported statically; it
  splits into a lazy chunk that loads only on the first human gesture
  (`focusin` / `pointerenter` / `touchstart`, so keyboard, mouse, touch,
  and assistive tech each trigger it). The input renders immediately and
  never unmounts, so typed text and focus survive hydration with no swap.
  The page loads inert; the chat wakes on intent.
- **Clear conversation.** Appears once a conversation exists; stops any
  in-flight stream and starts a fresh `Chat` with a new id (so the
  cleared conversation logs separately rather than overwriting).
- **Markdown-lite rendering.** See XSS note above.
- **Suggestion chips** on the empty state; an in-voice error path.

---

## Logging & observability

Finished conversations are shipped **fire-and-forget** to Replicator's
`/api/chat-log-ingest`, landing in the shared `chat_session` store under
`surface: "lj-concierge"`, browsable in Replicator's authenticated
`/chat-logs` UI (better than a hidden URL). Details:

- **PII-scrubbed before leaving our infrastructure.** A local regex
  redacts emails, US phone numbers, SSNs, and card-like digit runs from
  message text — applied *only* to the outgoing log, never to what the
  model sees or the visitor reads, and never to tool-result parts (our
  own content). No vendor, no per-message API call, no third-party
  data-sharing.
- **No visitor identity** is stored — messages only; `userName` is the
  ingesting agent key's label.
- **Per-step timings.** `onStepFinish` records each step's wall-clock
  `ms`, the tools it called, and its `finishReason`, forwarded so the
  concierge gets the same timing breakdown Replicator's editor chats
  have. (`finishReason` data is the thing to audit before touching
  `MAX_STEPS`.)
- Auth is a Replicator **org agent key** (same family as `/mcp`), so
  logging is skipped unless `REPLICATOR_CHAT_LOG_KEY` is set.

---

## System prompt & grounding rules

The persona is a warm, concise concierge that always links its sources
with root-relative paths. The grounding rules are the load-bearing part:

- Answer **only** from tool results and prompt facts.
- The Site index is **authoritative** for what-exists / where-is
  questions — answer those directly from it.
- Before claiming the site does **not** cover something, at least one
  tool must have been called *this turn* (`search_content` with synonyms,
  plus `list_customer_stories` for client/industry questions) — the
  anti-lazy-refusal fence. Only after tools come back empty may it say
  the site doesn't cover it, then point to `hello@lightningjar.com`.
- Never invent clients, projects, prices, dates, statistics, or
  capabilities. Pricing always routes to email.
- Stay on topic; decline off-topic in one sentence and steer back.

This split — index authoritative on the positive path, tool-call required
on the negative path — is what lets index-grounded answers skip
redundant tool calls while keeping the fence that stops lazy "we don't
cover that" refusals.

---

## Environment variables

Both optional; the route degrades gracefully without either.

| Var | Effect if absent |
|-----|------------------|
| `AI_GATEWAY_API_KEY` | Route returns 503 (fail-closed); chat unavailable |
| `REPLICATOR_CHAT_LOG_KEY` | Conversation logging is skipped; chat unaffected |

---

## Testing

- `tests/conciergeSiteIndex.test.ts` — `buildSiteIndex` determinism
  (static-block cache safety), curated size bound (~1.5–2k tokens, not
  the everything-index), the exact-total header count, presence of the
  curated pieces, and the curated-not-complete guarantee (no inlined blog
  / reading entries).
- The index test imports from `siteIndex.ts` directly because
  `agentTools.ts` pulls in `import.meta.glob` getters that Bun's test
  runtime can't evaluate; `buildSiteIndex` is re-exported from
  `agentTools` for the route.
- Manual dev verification set: an index-grounded question (expect zero
  list calls), a site-map question (fan-out shrinks), a negative probe
  (fence fires — search before declining), and the byte-stability check.

---

## Roadmap to the homepage

If the concierge graduates from experiment to a homepage feature:

1. ~~Redis-backed rate/budget counters~~ — shipped ahead of promotion:
   the shared limiter (`$lib/server/rateLimit`) backs both this route
   and `/mcp` with Upstash fixed-window counters, falling back to
   in-memory per-instance when unconfigured.
2. **BotID** — the real defense against spoofing bots.
3. An a11y + performance pass on the widget in its homepage placement.
4. Revisit `MAX_STEPS` only after auditing `finishReason` in the chat
   logs.
5. Consider **non-streaming** interactions (feedback, dynamic suggestion
   loading) as SvelteKit **remote functions** — a good fit for typed RPC.
   The streaming chat itself stays on the `/api/concierge` endpoint:
   remote functions' only streaming primitive (`query.live`) is a
   latest-value resource, not the append-only event log token streaming
   needs.
