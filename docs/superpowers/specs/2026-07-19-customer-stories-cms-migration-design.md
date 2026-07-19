# Customer Stories → Replicator CMS Migration — Design

**Date**: 2026-07-19
**Approved by**: Kevin Peckham (in-session)
**Status**: approved design, pre-implementation

## Goal

Migrate lj-website's 21 customer stories from JSON-in-git
(`src/lib/content/customer-stories/*.json`) into the replicator CMS as a
`customer-story` collection under the Lightning Jar org, mirroring the
blog migration. Editors get the same live-publish experience as the blog:
saving a story in replicator goes live on www.lightningjar.com within the
edge-cache window, no redeploy.

## Decisions (made in-session)

1. **Straight to the CMS** — no intermediate markdown-in-git era.
   Markdown is the *import format* only.
2. **Prose body + frontmatter extras** — narrative sections become the
   markdown body; structured data (banner, meta, customer, testimonials,
   perspectives, images, featuredTechnologies, tags, notice, order)
   lives in frontmatter, editable via the editor's advanced-fields JSON
   panel.
3. **Request-time rendering** — `/customer-stories` and
   `/customer-stories/[slug]` go `prerender = false` with edge caching,
   like the blog. Homepage tiles stay prerendered (resilience of the
   front door; refresh on next deploy).
4. **Approach A** for CMS scoping: a second LJ blog entity ("Customer
   Stories") with its own API key and URL templates, plus articles
   marked `collection: "customer-story"`, plus a public-API
   `?collection=` param. Rejected: shared key + param only (wrong editor
   URL templates); importing as `collection: "blog"` under a second
   entity (corrupts collection semantics, intermixes editor lists).
5. **Cleanup deletes the JSON files** after verification (unlike the
   blog's held cleanup — no study-pipeline entanglement). The
   conversion `.md` files are import artifacts and are deleted after
   import too.

## 1. Conversion format

One-off script converts each JSON story to `.md`:

- **Frontmatter** (verbatim-preserved by the importer): `slug`, `title`,
  `excerpt`, `order`, `draft`, `status: "published"` (injected — stories
  have no `date`, and the importer's status heuristic would otherwise
  file them as drafts), `meta`, `banner`, `customer`, `thumbnailImage`,
  `testimonials`, `perspectives`, `images`, `featuredTechnologies`,
  `tags`, `notice` (where present). The derived `technologies` array is
  dropped — it is computed at render time from git-resident technology
  content, which does not move.
- **Body**: the `content` blocks → `## {heading}` per section,
  `### {subheading}` where present, `"• "`-prefixed text entries become
  real markdown list items, inline HTML anchors become markdown links,
  remaining text entries become paragraphs.
- **Known, accepted rendering deltas** (not byte-parity, unlike the blog
  migration): real `<ul>` markup replaces bullet-glyph paragraphs;
  subheadings (currently silently dropped by the template) become
  visible `<h3>`s. Verification reviews these deltas explicitly.

## 2. Replicator changes (one release)

- `BlogArticleCollection` gains `"customer-story"`.
- Public API (`/api/public/blog/articles`, `…/articles/[slug]`,
  `…/sitemap`): optional `?collection=` param, validated against the
  collection union, default `"blog"` — fully backward-compatible. The
  server helpers already accept `collection` internally.
- `scripts/migrate-slx-web-blog.ts`: new `--collection=` flag (currently
  hardcodes `"blog"`) and `--blog=<blogId>` to stamp `blogId` at insert
  time.
- Provisioning (db, no code): second LJ blog entity — name "Customer
  Stories", slug `customer-stories`, `isDefault: false`, generated
  `blogk_…` key, `publicUrlTemplate:
  https://www.lightningjar.com/customer-stories/[slug]`,
  `draftUrlTemplate: https://www.lightningjar.com/blog/preview/[token]`
  (the generic preview route renders story bodies; structured
  banner/sidebar preview is a possible follow-up).
- Import: 21 stories, `collection=customer-story`, stamped to the new
  entity, draft tokens backfilled.
- Verify during implementation that `/repository/blog` and the private
  list API don't intermix collections (private GET defaults
  `collection=blog`); if the UI does intermix, a filter is a small
  follow-up, not part of this migration.

## 3. lj-website changes

- **Env**: new `CUSTOMER_STORIES_API_KEY` (`@required @sensitive`,
  value in the 1Password lj-website environment + `.env.local` is NOT
  needed — 1Password bulk-load provides it). `BLOG_CMS_BASE_URL` shared.
- **`getCustomerStories.ts`**: fetch-based, same exported names,
  `fetch`-parameterized like `getBlogArticles.ts`:
  - list: `?collection=customer-story&limit=200` with the stories key →
    `CustomerStory[]` from frontmatter, sorted by curated `order`.
  - detail: single-article endpoint → frontmatter + body markdown parsed
    by the local `parseMarkdown` (`sanitize: true, lazyImages: true`) →
    `html`.
  - `getNextCustomerStorySlug` keeps its wrap-around semantics, derived
    from the ordered list.
  - `featuredTechnologies` → technology enrichment unchanged (git
    content).
- **`CustomerStory` type**: `content: ContentBlock[]` replaced by
  `html: string` on the detail shape (list entries carry no body).
- **Detail page**: renders one `{@html data.html}` stream inside the
  existing `blog-article` prose container instead of the per-block loop.
  Frontmatter URLs bound to attributes go through `safeLinkUrl`.
- **Routes**: `/customer-stories/+page.server.ts` and
  `[slug=slug]/+page.server.ts` → `prerender = false`,
  `cache-control: public, s-maxage=300, stale-while-revalidate=3600`.
  Consumers (homepage tiles, `/sitemap.xml`, `/sitemap`) switch to the
  async getter; homepage stays prerendered.

## 4. Sequencing

1. Replicator: type + API param + importer flags → check/tests →
   commit → push → verify deployed.
2. Provision entity + convert JSONs → dry-run import → live import →
   verify via public API (`?collection=customer-story`, frontmatter
   round-trip diff, body parity).
3. lj-website: env + getter + routes + type → check/tests → baseline
   build diff (tolerant of the two accepted delta classes) → commit →
   push → verify production (all story URLs 200 + edge-cached, homepage
   tiles, sitemaps).
4. Cleanup: delete the 21 JSONs + conversion `.md`s; update
   CLAUDE.md's content-system notes and the migration memory.

## Risks / notes

- CSP already allows the blob + replicator hosts (previous commits);
  story images live on DO Spaces (`img-src` already allows) — any future
  image migration to Blob is already covered by the existing allowance.
- If the CMS is down, story routes 500 (blog already accepts this
  coupling; stale-while-revalidate softens it). Homepage unaffected.
- The importer's date heuristic is neutralized by injected
  `status: "published"`; `publishedAt` stays null and ordering comes
  from frontmatter `order` on the consumer side.
