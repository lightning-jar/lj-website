---
name: aeo-bench-data
description: Query AEO Bench, Lightning Jar's open, pre-registered benchmark series measuring whether agent-readiness and answer-engine-optimization techniques actually help AI agents use websites — list studies, read full findings, and pull supporting resources via the public keyless MCP server or plain HTTP.
---

# Querying AEO Bench Data

AEO Bench is an open series of pre-registered studies measuring whether
the techniques that promise to make websites agent-ready (llms.txt,
sitemap.xml, markdown content negotiation, and related answer-engine
-optimization advice) measurably change what AI agents find and what it
costs them to find it. Studies run against controlled site fixtures with
real HTTP semantics, seeded questions with known answers, mechanical
grading, and token cost as a first-class outcome. Hypotheses, corpora,
and graders are committed before any scored run; results are published
as found, corrections included. Everything is public and keyless.

## Primary interface: the MCP server

Endpoint: `POST https://www.lightningjar.com/mcp` — Model Context
Protocol, streamable HTTP, stateless (no session or initialize
handshake required), no authentication.

Relevant tools (shared across both Lightning Jar research projects;
every study row carries a `project` field, `"aeo-bench"` for this
series):

- `list_studies` — every study across both projects: project, letters,
  slug, track, title, and a one-line result. Filter on
  `project === "aeo-bench"`.
- `read_study` — one study by slug (slugs are unique across projects;
  AEO studies use numbers, e.g. `"1"`): full section text, chart
  titles, and a link to its pre-registration brief.
- `search_content` — keyword search across the whole site, including
  studies.

Example call:

```sh
curl -s -X POST https://www.lightningjar.com/mcp \
  -H "content-type: application/json" \
  -H "accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"read_study","arguments":{"slug":"1"}}}'
```

The result's `content[0].text` is a JSON document with the study's
sections, chart titles, and pre-registration link.

## Plain HTTP alternatives

- `https://www.lightningjar.com/research/aeo-bench` — the results
  dashboard (HTML), with the study index and headline stats.
- `https://www.lightningjar.com/research/aeo-bench/atom.xml` — one
  feed entry per published study.
- `https://www.lightningjar.com/llms.txt` — the site index, including
  one line per AEO study with its result.
- `https://github.com/kevinpeckham/aeo-bench` — pre-registration
  briefs, graders, and the full report.
