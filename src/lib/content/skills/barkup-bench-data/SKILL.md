---
name: barkup-bench-data
description: Query Barkup Bench, Lightning Jar's open, pre-registered benchmark series on how LLM agents read and edit structured document trees — list studies, read full findings, and pull supporting resources via the public keyless MCP server or plain HTTP.
---

# Querying Barkup Bench Data

Barkup Bench is an open series of pre-registered studies measuring how
LLM agents read and edit structured document trees (the `barkup` HTML
dialect + whole-tree rewrites vs. JSON + granular mutation tools, plus
follow-on tracks on instruction phrasing, agent-surface steering, and
guardrail design). Everything is public and keyless.

## Primary interface: the MCP server

Endpoint: `POST https://www.lightningjar.com/mcp` — Model Context
Protocol, streamable HTTP, stateless (no session or initialize
handshake required), no authentication.

Relevant tools:

- `list_studies` — every study: letters (e.g. "AO"), slug, track,
  title, and a one-line result.
- `read_study` — one study by slug: full section text, chart titles,
  and a link to its pre-registration brief.
- `search_content` — keyword search across the whole site, including
  studies.

Example call:

```sh
curl -s -X POST https://www.lightningjar.com/mcp \
  -H "content-type: application/json" \
  -H "accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"read_study","arguments":{"slug":"ao"}}}'
```

The result's `content[0].text` is a JSON document with the study's
sections, chart titles, and pre-registration link.

## Plain-HTTP alternatives

- `https://www.lightningjar.com/llms.txt` — markdown site index with a
  one-line summary of every study.
- `https://www.lightningjar.com/search-index.json` — all site content
  as JSON records (`type: "study"` entries carry title, blurb, url).
- `https://www.lightningjar.com/research/barkup-bench` — the results
  dashboard (headline stats, study index, crossover findings).
- `https://www.lightningjar.com/research/barkup-bench/{slug}` — study
  pages (charts, tables, full analysis). Each page embeds
  ScholarlyArticle JSON-LD with citation links.
- `https://www.lightningjar.com/research/barkup-bench/playbook` — The
  Builder's Playbook: ten measured guidelines derived from the studies.
- `https://www.lightningjar.com/research/barkup-bench/atom.xml` — feed
  of new studies.

## Source of truth

Pre-registration briefs and full reports live in the benchmark repo:
`https://github.com/kevinpeckham/barkup-bench` (see `docs/BRIEF-*.md`
and per-study `REPORT.md` files). The measured library is
`https://github.com/kevinpeckham/barkup`.

## Tips

- Studies are identified by letters ("Study AO") in prose and by
  lowercase slug (`ao`) in URLs and tool arguments.
- Blog articles about the studies return source markdown when requested
  with `Accept: text/markdown`.
- For headline claims, prefer `read_study` over the blog articles: the
  study pages are the canonical statement of what was measured.
