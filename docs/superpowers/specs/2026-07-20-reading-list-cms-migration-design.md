# Reading List → Replicator CMS Migration — Design

**Date**: 2026-07-20
**Approved by**: Kevin Peckham (in-session)
**Status**: approved design, pre-implementation

Third pass of the CMS migration pattern. Shares the architecture of the
customer-stories migration
(`2026-07-19-customer-stories-cms-migration-design.md`); this spec
records only the deltas.

## Deltas from the customer-stories design

1. **No prose body** (decided in-session): reading-list entries are pure
   metadata (`Article` shape). Everything rides in frontmatter with
   `status: "published"` injected; the markdown body is EMPTY. Editing
   happens in the editor's advanced-fields JSON panel; the WYSIWYG is
   not useful for this collection.
2. **Collection**: `"reading-list"` joins `BlogArticleCollection`
   (types file + the schema's synced duplicate), the `VALID` list in
   `parsePublicCollectionParam` (+ test case), and the importer's flag
   validation. No other replicator code changes — the `?collection=`
   plumbing (3.217.0) is already generic. Release as 3.218.0.
3. **Entity**: third LJ blog entity "Reading List", slug
   `reading-list`, own key (`READING_LIST_API_KEY` on the lj side).
   `publicUrlTemplate` → `https://www.lightningjar.com/reading-list`
   (the landing page — there are no per-entry routes).
   `draftUrlTemplate` → null (previewing an empty body is useless).
4. **lj-website consumers** (28 entries, `repostDate` desc):
   - `getReadingList.ts` → `getAllReadingListArticles(fetch)`;
     `readingListSitemapSection` stays a static const (it never used
     entry data).
   - `/reading-list/+page.server.ts` → `prerender = false`,
     `s-maxage=300` + swr.
   - `feedEntries.buildReadingListEntries(baseUrl, articles)` —
     parameterized like `buildBlogEntries`.
   - `/reading-list/atom.xml` → `prerender = false`, fetch in GET,
     `s-maxage=900` + swr (`/atom.xml` is already dynamic and just
     passes the fetched list).
5. **Verification**: page/feed output should be byte-identical modulo
   build noise (frontmatter round-trips verbatim; there is no body HTML
   to differ). Same normalized-diff tooling.
6. **Cleanup**: delete the 28 JSONs after production verification;
   update CLAUDE.md's Content System + the migration memory.
