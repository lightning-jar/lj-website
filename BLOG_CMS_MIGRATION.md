# Blog CMS migration — lj-website side

**Status**: briefing for the migration agent. This is the second
execution of a migration that has already run once, successfully, for
www.securelogix.com — `~/projects/slx-web/BLOG_CMS_MIGRATION.md` is
that run's contract and your primary worked example; read it FIRST and
mirror it wherever this document doesn't say otherwise. The CMS
architecture lives in `~/projects/slx-replicator/docs/blog-cms.md`;
the public API source in
`~/projects/slx-replicator/src/routes/api/public/blog/`.

> This document is the contract. The session that wrote it will not
> see your follow-up questions. Where it's ambiguous, the SLX briefing
> + the CMS source are the tie-breakers; where those are ambiguous,
> stop and ask Kevin.

**Goal**: lj-website's `/blog` (48 markdown articles in
`src/lib/content/blog/`, eagerly imported via `import.meta.glob` and
parsed by the local `parseMarkdown.ts`) moves to the replicator CMS
under the **Lightning Jar org**, exactly as slx-web's blog moved under
the SecureLogix org. lj-website becomes a fetch-time consumer of the
org-scoped public API; everything else on the site stays content-in-git.

---

## VM / workspace facts you need (not in the SLX briefing)

- All repos are checked out under `~/projects/` on this VM
  (`lj-website`, `slx-replicator`, `slx-web` for reference). Workspace
  map: `~/projects/CLAUDE.md`.
- **lj-website works off the `production` branch** (its `dev` branch
  was stale for two months and has been fast-forwarded; treat
  `production` as trunk). Pushing `production` deploys
  www.lightningjar.com via Vercel.
- The lj-website dev server is already running in tmux window 3
  (session `bench`, `~/bin/lj-dev`, port 5173, viewable at
  `https://lj-bench.exe.xyz:5173/`). If you start the replicator dev
  server it will auto-pick 5174 — the SLX briefing's local-URL caveat
  applies.
- slx-replicator env is live on this VM (`.env.local` → 1Password;
  `APP_ENV=development bunx varlock run -- …` for db-touching scripts,
  per its CLAUDE.md).
- **Coordination rule**: another session is actively landing small
  commits to `slx-replicator` (benchmark digest updates). `git pull`
  immediately before any replicator commit; conflicts are unlikely
  (different files) but cheap to avoid.

## Phase 0 — orientation (read-only)

1. Read the SLX briefing end-to-end, then `blog-cms.md`, then skim
   `slx-replicator/scripts/migrate-slx-web-blog.ts` (the importer you
   will reuse — it is org- and source-parameterized, idempotent,
   hash-aware, `--dry-run` capable, and preserves frontmatter verbatim
   in `blog_article.frontmatter_json`).
2. Identify the Lightning Jar org id in replicator (Kevin says the org
   exists; find its id via the replicator UI or a read-only db query).
   Record it in your working notes; scripts take `--org=<orgId>`.
3. Enumerate every lj-website consumer of blog content before touching
   anything: `grep -rn "getBlogArticles\|content/blog" src/`. Known
   consumers: `src/routes/blog/`, `src/routes/atom.xml/`, sitemap
   routes, the archive route, and the research dashboard's series
   list. The getter is `src/lib/content/getters/getBlogArticles.ts`
   (NOT `getBlogContent.ts` — naming differs from slx-web).

## Phase 1 — replicator side (Lightning Jar org)

1. **Provision the LJ blog + API key.** The `blog` table carries a
   unique `api_key` (schema ~line 3046). Mirror however the SLX blog
   row was provisioned (check `setup-blog-urls.ts` and the blog
   settings UI before writing any manual insert). The public API
   resolves org scope from the key (`articles/+server.ts` →
   `blog.orgId`) — **no API code changes are expected**; if you find
   yourself editing `src/routes/api/public/`, stop and re-read,
   because multi-tenancy is already built.
2. **Import the 48 articles**:
   `APP_ENV=development bunx varlock run -- bun run
   scripts/migrate-slx-web-blog.ts --org=<LJ_ORG_ID>
   --source=../lj-website/src/lib/content/blog --dry-run` first;
   review; then run live. Watch for LJ-specific frontmatter the SLX
   corpus didn't exercise: `quote` (text + attribution), `glossary`
   (term/definition arrays), `imageDescription`, `metaTitle`. The
   importer preserves frontmatter verbatim — your job is to verify the
   PUBLIC API exposes those fields intact (fetch one article, diff its
   frontmatter against the source `.md`).
3. **Images**: LJ article `image:` URLs point at DigitalOcean Spaces
   (`lj-01.nyc3.cdn.digitaloceanspaces.com`). Decide with the SLX
   precedent (`migrate-blog-images.ts` moved external images to Vercel
   Blob in-org). Recommended: same move, `--dry-run` first. If
   deferred, the site keeps rendering DO URLs — note it as debt.

## Phase 2 — lj-website side

Mirror the SLX TL;DR, adjusted for names:

1. Env vars `BLOG_CMS_BASE_URL` + `BLOG_API_KEY` — add to
   `.env.schema` per lj-website's varlock conventions (`@sensitive`
   for the key), values in `.env.local` + Vercel.
2. Rewrite `src/lib/content/getters/getBlogArticles.ts` to fetch from
   the CMS; keep exported method names identical; methods become
   async; update all Phase-0 consumers to `await`.
3. **Keep `parseMarkdown.ts` untouched** — same reasoning as SLX: the
   CMS stores markdown source; the site parses locally so published
   HTML stays bit-identical.
4. `cache: 'force-cache'` + `event.fetch`, per the SLX contract's
   caching section.
5. **Prerendering caveat the SLX briefing doesn't cover**: lj-website
   is static-first — most routes export `prerender = true`, so "fetch
   at request time" is actually "fetch at BUILD time" for prerendered
   blog routes. That is acceptable (a CMS edit then needs a redeploy
   or ISR decision) but it must be a DECISION, not an accident:
   propose either keeping prerender (rebuild-on-publish, simplest) or
   switching blog routes to server-rendered with edge caching (live
   updates, matches slx-web). Present the trade-off to Kevin before
   implementing either.

## Phase 3 — verification, then cleanup

- Verify per the SLX contract's section 4 (route-by-route diff of
  rendered HTML against the git version BEFORE deleting anything),
  plus lj-specific surfaces: atom.xml output diff, sitemap diff,
  research-dashboard series list, archive route.
- **The golden-render test must be redesigned, not deleted.**
  `tests/blogCorpus.test.ts` + `tests/fixtures/blog-corpus-hashes.json`
  characterize `parseMarkdown` against the committed `.md` corpus;
  when the corpus leaves git the test loses its input. Recommended
  redesign: commit a frozen SNAPSHOT of the markdown corpus as test
  fixtures (parser characterization decoupled from live content) —
  the parser keeps its guard, the CMS owns the content. Propose to
  Kevin if you prefer another shape.
- Only after verification: delete `src/lib/content/blog/*.md` and the
  glob loading in the getter.

## Things that do NOT move (deliberately)

Reading list, customer stories, landing pages, technologies,
testimonials, terms — all stay content-in-git (`getReadingList.ts`
etc. untouched). Mirror of the SLX "news/press stay" decision. The
research dashboard's own content (`bench-content.json`, charts,
playbook) also stays in git.

## Workflow change to flag loudly (get Kevin's sign-off)

Today, barkup-bench study results propagate to blog articles via git
commits on `production` (e.g. the Study AL update block on
`the-twenty-first-note`, commit `e18ec33`). After this migration,
**blog update blocks become CMS edits in replicator** — the study
pipeline's "downstream outputs" step changes shape (dashboard/stats
stay git; article updates move to the CMS, editable via replicator's
editor or API). Confirm Kevin wants that split before Phase 3
cleanup, because it changes how the next study publishes.

## When something goes wrong

Same escalation as the SLX contract: the CMS source of truth is
`src/routes/api/public/blog/`, architecture in `docs/blog-cms.md`,
CHANGELOG v3.61.0–v3.65.4. If the public API needs an actual change
for the LJ case (it shouldn't), that's a replicator-side commit with
its own review — coordinate per the rule above.
