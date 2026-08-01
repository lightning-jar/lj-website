# Ask Eljay — the site chat agent

Ask Eljay (formerly "Concierge"; rebranded 2026-08-01) is
lightningjar.com's visitor-facing chat agent: a tool-grounded guide to
the studio's work, research, packages, and writing that answers only
from the site's own published content and links its sources. This
document describes the implementation as it ships.

## Surfaces

| Surface | Where | What |
|---|---|---|
| Full page | `/ask-eljay` (`src/routes/ask-eljay/`) | The standalone chat experience. `/concierge` 301s here (`vercel.ts`). |
| Homepage launcher | `ConciergeLauncher.svelte`, rendered from `/` | Floating bottom-right button opening a panel that wraps the same chat component. |
| Chat API | `POST /api/concierge` | The backend both surfaces stream from (path kept through the rebrand — it is an internal API). |
| Public MCP | `POST /mcp` | The same tool layer, served keyless and read-only to visiting agents. |

The chat UI is one component, `src/lib/components/ConciergeChat.svelte`,
used by both the full page and the launcher. The tool layer is one
module, `src/lib/server/agentTools.ts`, used by both the chat API and
the MCP server — the homepage agent is a live demonstration of the same
surface we advertise to other agents, and the two cannot drift.

## Retrieval architecture

The design is the direct product of the AEO Bench series
(`/research/aeo-bench`), which was run to settle it:

- **Curated index in context (Study 3).** `siteIndex.ts` builds a
  curated site index — sections, every research study with its slug,
  package names, and `search_content` pointers for the long collections
  — and the route prefetches it into the system prompt. Study 3
  measured this at 9.4k input tokens per solved task against 13.5k for
  an index tool and 41.3k for a hint; the giant everything-index cost
  2.68x for zero accuracy gain, so the index is deliberately curated.
  The index is built once per process and byte-stable (`buildSiteIndex`
  is pure; dynamic counts ride in as arguments), because it lives in
  the cached system block.
- **Anthropic prompt caching.** The system prompt (instructions + site
  index) is a single static `SystemModelMessage` carrying
  `cacheControl: { type: "ephemeral" }`. Nothing per-request may enter
  that string; every turn after the first reads it at ~10% input price.
- **Markdown to the model (Study 1).** `read_blog_article` and
  `read_customer_story` return raw markdown bodies, and `read_page`
  negotiates `Accept: text/markdown` with an HTML-strip fallback —
  Study 1 measured markdown saving 20–74% of the tokens HTML costs.
- **Tools.** about_lightning_jar, search_content, list/read for blog,
  customer stories, reading list, read_page (enum-constrained overview
  pages), read_study. `read_study` normalizes path-shaped slugs
  (`"aeo-bench/1"`, full URLs, any case) to the bare slug and returns a
  format-teaching error on a miss — added after production chat logs
  showed an agent burning 4 of its 6 tool steps guessing slug shapes.
- **CMS memoization.** All CMS-backed tool data rides a 120s in-instance
  TTL memo (`ttlCache.ts`: shared in-flight fills, rejection eviction,
  size bounds), so a burst of tool calls hits the Replicator CMS once
  per collection, not once per call.

Grounding rules in the system prompt make the index authoritative for
what-exists questions, require a tool call before any "the site doesn't
cover X" claim, forbid invented facts/prices/dates, and treat tool
output as data rather than instructions. The prompt also carries the
studio's history verbatim (founded by Alan Ruthazer; led today by Kevin
Peckham, with the studio since 2011, and Alex Cantu) after a production
answer conflated "since 2001" with the current principal.

## Model

`anthropic/claude-haiku-4.5` via the Vercel AI Gateway, temperature
0.3, 800 output tokens, `stepCountIs(6)`. Haiku was selected by
registered backfill in the AEO series: 28/28 present-class in every
Study 1 arm, zero invented facts, perfect linked-class sweep in Study
2, and the best economics in Study 3's readiness gate — at roughly a
third of sonnet's price. Model quality escalation (opus tier) is
deliberately deferred until abuse hardening proves out and logs show
Haiku's quality wanting.

## Suggested-prompt response cache

The suggestion chips are fixed strings in
`src/lib/data/conciergeSuggestions.ts` (single source of truth for the
UI chips and the server allowlist — currently twelve prompts). A
first-turn message that exactly matches an allowlisted prompt is served
from `responseCache.ts`: Upstash `GET`/`SET EX` when `KV_REST_API_*`
is configured (shared across instances), in-memory fallback otherwise.

- Hits replay the stored answer in the UI-message-stream wire format
  (start → text → finish → `[DONE]`) with an `x-concierge-cache: hit`
  header. Measured: ~70ms against 4–6s of model streaming; the real
  client renders in ~185ms with markdown links intact.
- Only clean `finishReason: "stop"` answers are stored, so refusals and
  truncations never cache. TTL 6h keeps cited content fresh.
- Hits skip the chat-log ship (the filling conversation already logged)
  and never run the model, so they cost no tokens.
- Free-typed questions and follow-up turns are never cached.

## Security and abuse posture

Fail-closed core: no `AI_GATEWAY_API_KEY` → 503; the site never
depends on the route. Then layered fences (fences, not walls — the AI
Gateway credit cap is the hard backstop):

- **Origin allowlist.** Browsers always send Origin on fetch POSTs;
  only the site's own origins pass. Spoofable by a determined client,
  which is fine — it filters drive-by scripts.
- **Rate limits** (`rateLimit.ts`, shared with `/mcp`): fixed-window
  counters over the Upstash REST pipeline when configured, in-memory
  per-instance fallback. Chat: 10/5min per IP + 400/day global. MCP:
  60/5min per IP + 2,000/day — sized as anti-runaway, not anti-usage
  (Study 1 measured 2.7–4.9 fetches per agent task, and cloud agents
  share egress IPs). 429s carry `Retry-After`; MCP additionally answers
  with a JSON-RPC error body so protocol clients back off cleanly.
- **Size caps.** ≤12 user turns, ≤2k chars per text part, ≤40 messages,
  ≤24k total chars, ≤800 output tokens, ≤6 tool steps.
- **Message scrubbing.** Incoming history is stripped to user/assistant
  roles and plain text parts (control characters removed) — a hostile
  client cannot inject file parts or fabricated tool results.
- **Human-origin gating, not BotID.** The AI SDK loads only on a real
  gesture (see Client below), which the CCRTA maps sprint (July 2026)
  proved is the measure that actually kills automated abuse: the client
  responsible for ~85% of that bill never emitted a human-origin event.
  BotID Deep Analysis was enabled and reverted there (~0.5s → ~20s
  mobile latency; its fetch wrapper defeats AbortSignal timeouts), so
  it is demoted here. If abuse materializes, the evidence-backed
  escalation is operational: Vercel Firewall Challenge on
  `/api/concierge` (never on `/mcp` — inviting agents is its purpose),
  with the Redis counters as the measurement channel.

## Client

`ConciergeChat.svelte`:

- **Lazy hydration.** The AI SDK (`@ai-sdk/svelte` + `ai`, ~474KB) is
  dynamically imported on the first human gesture (focusin,
  pointerenter, touchstart); the input element renders immediately and
  never unmounts, so typed text and focus survive activation. Verified
  repeatedly: zero AI requests before a gesture.
- **markdown-lite renderer.** The model's replies render through a
  whitelist-only renderer: escape all HTML first, stash code spans and
  links behind private-use sentinels, emphasize, restore in a bounded
  loop. Hrefs are restricted to root-relative single-slash paths,
  explicit `https://`, and `mailto:`; `javascript:`, `//`, quotes, and
  backslashes are rejected. Visual styling lives in the `chat-response`
  shortcut in `uno.config.ts`.
- **Instance exports.** `reset()` is a component instance export; the
  launcher calls it via `bind:this`. A `hideClearButton` prop lets the
  launcher suppress the inline clear button (its header has its own)
  while the full page keeps it.
- **Suggestions.** Three chips are picked at random from the shared
  twelve client-side in `onMount` (SSR renders a deterministic first
  three so hydration agrees).

`ConciergeLauncher.svelte` (homepage only, rendered from `/`):

- Built on the **native popover API**: the panel is `popover="auto"` in
  the top layer, toggled declaratively via `popovertarget`; Escape,
  light dismiss, and focus-return are platform behavior. The panel
  stays in the DOM when closed, so the conversation survives reopen.
- **CSS anchor positioning** pins the panel to the launcher
  (`anchor-name`/`position-anchor`, 12px gap) as progressive
  enhancement; fixed bottom/right utilities are the fallback.
- The `[popover]` UA stylesheet resets `color` to CanvasText — the
  panel sets an explicit text color or the chat input renders black on
  navy. Learned the hard way; axe verified.
- `BackToTop` yields the corner on `/` only (`+layout.svelte`).

## Logging

Finished conversations ship fire-and-forget to Replicator's
`/api/chat-log-ingest` (org agent key in `REPLICATOR_CHAT_LOG_KEY`;
skipped silently when unset), surface `lj-concierge`, where the
`/chat-logs` review UI renders external streams distinct and filterable
from Replicator-native chats. Before leaving our infrastructure, text
parts are PII-redacted (emails, SSNs, card-like digit runs, US phones);
tool parts ship unredacted (they carry only our public content). Each
log carries `stepTimings` — per-step wall-clock, tool names, and
finishReason — which is what surfaced the read_study slug-guessing
loop within a day of activation. User messages composed with the
dictation button carry `metadata: { voice: true }` (the scrubber
allowlists exactly that literal and drops all other client metadata),
so voice-input usage is identifiable in the logs. Cache hits do not
ship logs.

## Environment

All via varlock (`.env.schema`), values in the 1Password environment:

- `AI_GATEWAY_API_KEY` — required for the route to answer (503 without).
- `KV_REST_API_URL` / `KV_REST_API_TOKEN` — optional; Upstash for the
  shared rate limiters and the response cache. Absent → in-memory
  per-instance fallbacks.
- `REPLICATOR_CHAT_LOG_KEY` — optional; `agentk_…` org key minted in
  Replicator's Organization Settings → Agent Keys. Absent → logging
  skipped. Note: varlock resolves at build time, so env changes need a
  redeploy.

## Testing

- `tests/conciergeSiteIndex.test.ts` — index determinism, size bounds,
  cache-block safety (no per-request markers), exact study count.
- `tests/rateLimit.test.ts` / `tests/responseCache.test.ts` /
  `tests/ttlCache.test.ts` — both Redis (mocked pipeline) and
  in-memory modes.
- `tests/pickRandom.test.ts` — chip selection helpers.
- The tool layer (`agentTools.ts`) imports `import.meta.glob` getters
  and cannot run under bun test; its behavior is verified live against
  the dev server (MCP `tools/call` + chat probes) — see the commit
  messages for the verification transcripts of each change.
- Browser verification via Playwright: gesture-gated zero-request
  guarantee, axe scans (WCAG 2A/AA/2.1AA) with the panel open and
  closed, popover keyboard behavior, cache-hit rendering.

## History and open items

- Redis-backed counters and the response cache shipped 2026-07-31/08-01;
  BotID demoted on CCRTA evidence (see Security above).
- Remaining from the homepage-promotion list: revisit `MAX_STEPS` only
  after auditing `finishReason` in the chat logs; watch chip-vs-freeform
  hit rates in the logs before growing the cache allowlist.
- Streaming chat stays on `/api/concierge` (SvelteKit remote functions'
  `query.live` is a latest-value resource, not an append-only token
  log); non-streaming interactions (feedback, dynamic suggestions) are
  remote-function candidates if added.
