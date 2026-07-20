# Reading List → Replicator CMS Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the 28 reading-list entries into the replicator CMS as a `reading-list` collection (third LJ blog entity) and switch lj-website to request-time fetching.

**Architecture:** Per the spec (`docs/superpowers/specs/2026-07-20-reading-list-cms-migration-design.md`): all-frontmatter entries with empty markdown bodies; everything else mirrors the executed customer-stories plan (`2026-07-19-customer-stories-cms-migration.md`), whose tooling (provision/convert/verify scratchpad scripts) is adapted, not rebuilt.

**Tech Stack:** unchanged from the stories plan.

## Global Constraints

Same as the stories plan (conventional commits, CHANGELOG+version bump in replicator, `git pull` before replicator commits, varlock run prefix for db scripts, lj trunk = `production`, `bun test`+`check` before commits). LJ org `org-Vm6A0J5Wt7duzc5dIU2yj`, owner `HJbHJS9OMVqV797nBccg4ICEsfT55KQy`.

---

### Task 1: Replicator — `reading-list` in the collection unions (3.218.0)

**Files:** Modify `src/lib/types/BlogArticleCollection.ts`, `src/lib/server/db/schema.ts` (synced duplicate at ~line 28), `src/lib/utils/parsePublicCollectionParam.ts` (VALID), `scripts/migrate-slx-web-blog.ts` (flag validation list); Test `tests/lib/utils/parsePublicCollectionParam.test.ts` (accepts reading-list case).

- [ ] Add `| "reading-list"` to both union declarations and both VALID arrays; add test `expect(parsePublicCollectionParam(new URL("https://x/api?collection=reading-list"))).toBe("reading-list")`.
- [ ] `bun run check` (0 errors) + `bun test` (all pass) under varlock.
- [ ] CHANGELOG 3.218.0 ("reading-list joins the public collection union") + version bump; `git pull`; commit; push; poll `?collection=reading-list` on prod until 200 (with any valid key) instead of 400.

### Task 2: Provision + convert + import

- [ ] Adapt the provision script: slug `reading-list`, name "Reading List", `publicUrlTemplate: https://www.lightningjar.com/reading-list`, `draftUrlTemplate: null`. Record id + key.
- [ ] Conversion script: read `src/lib/content/reading-list/*.json`; frontmatter = whole object + `status: "published"`; body = "" (file ends `---\n`). Round-trip guard (importer split regex + yaml, deep-compare vs source JSON + status).
- [ ] Dry-run import (`--collection=reading-list --blog=<id>`, expect 28) → live import (28 inserted, 0 failed).
- [ ] API verify on prod: list with new key + `?collection=reading-list` → total 28; blog/story streams unchanged (48/21); one detail round-trip (frontMatter deep-equal, markdown === "").

### Task 3: lj-website — env, getter, consumers

**Files:** `.env.schema` (+`READING_LIST_API_KEY`, @required @sensitive, startsWith blogk_), `.env.local` (temp literal until 1Password has it), `src/lib/content/getters/getReadingList.ts` (rewrite), `src/routes/reading-list/+page.server.ts`, `src/lib/utils/feedEntries.ts`, `src/routes/atom.xml/+server.ts`, `src/routes/reading-list/atom.xml/+server.ts`.

**Interfaces:** `getAllReadingListArticles(fetch: typeof globalThis.fetch): Promise<Article[]>` (repostDate desc); `readingListSitemapSection` unchanged static export; `buildReadingListEntries(baseUrl: string, articles: Article[]): FeedEntry[]`.

- [ ] Getter: mirror `getCustomerStories.ts` fetch/auth structure with `READING_LIST_API_KEY` + `collection=reading-list`; map `item.frontMatter as Article`; sort `b.repostDate.localeCompare(a.repostDate)` with the existing null guard. No detail function, no parseMarkdown.
- [ ] `/reading-list/+page.server.ts`: `prerender = false`, `setHeaders` s-maxage=300+swr, `await getAllReadingListArticles(fetch)` in load (read current file first, keep return shape).
- [ ] `feedEntries.ts`: `buildReadingListEntries(baseUrl, allReadingListArticles)` param; update `/atom.xml` GET to fetch + pass; `/reading-list/atom.xml`: `prerender = false`, fetch in GET, s-maxage=900+swr header.
- [ ] `bun run check` + `bun test` + build; local `bun preview`: `/reading-list` 200 + cache header, entries render; `/reading-list/atom.xml` + `/atom.xml` contain entries; normalized diff vs pre-change build — expect only the dynamic-route removals + build noise.
- [ ] Commit + push. **HANDOFF: Kevin adds `READING_LIST_API_KEY` to 1Password** (surfaced when generated); expect one failed deploy if pushed before that lands, then redeploy (empty commit).

### Task 4: Production verify + cleanup

- [ ] Prod: `/reading-list` 200 + `x-vercel-cache`; feeds carry entries; spot-check one entry's title/summary text matches pre-migration.
- [ ] Delete `src/lib/content/reading-list/*.json` (28); check/test/build stay green; delete scratchpad artifacts.
- [ ] CLAUDE.md Content System: reading list moves to the CMS list; memory file updated (entity id/key, shipped state).
- [ ] Commit + push; final prod spot-check.
