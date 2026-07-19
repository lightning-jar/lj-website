# Customer Stories → Replicator CMS Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move lj-website's 21 customer stories from JSON-in-git into the replicator CMS as a `customer-story` collection with its own blog entity + API key, and switch lj-website to request-time fetching, matching the blog.

**Architecture:** Approach A from the spec (`docs/superpowers/specs/2026-07-19-customer-stories-cms-migration-design.md`): second LJ blog entity scopes the stream (own key + URL templates); articles carry `collection: "customer-story"`; the public API gains a validated optional `?collection=` param; lj-website's `getCustomerStories.ts` becomes fetch-based with markdown bodies parsed by the local `parseMarkdown`.

**Tech Stack:** SvelteKit 2/Svelte 5, Bun, Drizzle/Turso, varlock + 1Password, Vercel.

## Global Constraints

- Replicator repo: conventional commits, CHANGELOG entry + version bump per release, `git pull` immediately before any commit (another session lands commits), `APP_ENV=development bunx varlock run --` prefix for db-touching scripts.
- lj-website repo: trunk is `production`; pushing deploys. Biome tabs. `bun test` + `bun run check` before commits.
- LJ org id: `org-Vm6A0J5Wt7duzc5dIU2yj`; owner user `HJbHJS9OMVqV797nBccg4ICEsfT55KQy`.
- Do not touch `src/lib/utils/parseMarkdown.ts`.
- Frontmatter URLs bound to href/src must pass through `$utils/safeLinkUrl`.

---

### Task 1: Replicator — collection type + public API `?collection=` param

**Files:**
- Modify: `slx-replicator/src/lib/types/BlogArticleCollection.ts`
- Create: `slx-replicator/src/lib/utils/parsePublicCollectionParam.ts`
- Test: `slx-replicator/tests/lib/utils/parsePublicCollectionParam.test.ts`
- Modify: `slx-replicator/src/routes/api/public/blog/articles/+server.ts`
- Modify: `slx-replicator/src/routes/api/public/blog/articles/[slug]/+server.ts`
- Modify: `slx-replicator/src/routes/api/public/blog/sitemap/+server.ts`

**Interfaces:**
- Produces: `parsePublicCollectionParam(url: URL): BlogArticleCollection` (throws SvelteKit `error(400)` on invalid values; returns `"blog"` when absent). Public endpoints accept `?collection=blog|news|press|customer-story`.

- [ ] **Step 1: Extend the collection union**

```ts
// src/lib/types/BlogArticleCollection.ts
export type BlogArticleCollection = "blog" | "news" | "press" | "customer-story";
```

- [ ] **Step 2: Write the failing test**

```ts
// tests/lib/utils/parsePublicCollectionParam.test.ts
import { describe, expect, test } from "bun:test";

import { parsePublicCollectionParam } from "../../../src/lib/utils/parsePublicCollectionParam";

describe("parsePublicCollectionParam", () => {
	test("defaults to blog when absent", () => {
		expect(parsePublicCollectionParam(new URL("https://x/api"))).toBe("blog");
	});

	test("accepts customer-story", () => {
		expect(
			parsePublicCollectionParam(new URL("https://x/api?collection=customer-story")),
		).toBe("customer-story");
	});

	test("accepts news and press", () => {
		expect(parsePublicCollectionParam(new URL("https://x/api?collection=news"))).toBe("news");
		expect(parsePublicCollectionParam(new URL("https://x/api?collection=press"))).toBe("press");
	});

	test("rejects unknown collections with 400", () => {
		expect(() =>
			parsePublicCollectionParam(new URL("https://x/api?collection=nope")),
		).toThrow();
	});
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd ~/projects/slx-replicator && bun test tests/lib/utils/parsePublicCollectionParam.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 4: Implement the util**

```ts
// src/lib/utils/parsePublicCollectionParam.ts
import { error } from "@sveltejs/kit";

import type { BlogArticleCollection } from "$types";

const VALID: BlogArticleCollection[] = ["blog", "news", "press", "customer-story"];

/**
 * Optional `?collection=` on the public blog endpoints. Absent → "blog"
 * (backward compatible); unknown values → 400.
 */
export function parsePublicCollectionParam(url: URL): BlogArticleCollection {
	const raw = url.searchParams.get("collection");
	if (raw === null) return "blog";
	if ((VALID as string[]).includes(raw)) return raw as BlogArticleCollection;
	throw error(400, `Unknown collection: ${raw}`);
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `bun test tests/lib/utils/parsePublicCollectionParam.test.ts`
Expected: 4 pass

- [ ] **Step 6: Thread the param through the three endpoints**

In `articles/+server.ts`: add import, parse once, pass to the helper:

```ts
import { parsePublicCollectionParam } from "$utils/parsePublicCollectionParam";
// inside GET, before the query:
const collection = parsePublicCollectionParam(url);
// add to the options object:
const rows = await getPublicBlogArticles(orgId, {
	limit: Number.isFinite(limit) ? limit : 50,
	offset: Number.isFinite(offset) ? offset : 0,
	featuredOnly,
	blog,
	collection,
});
```

In `articles/[slug]/+server.ts` (GET signature gains `url`):

```ts
export const GET: RequestHandler = async ({ params, request, url }) => {
	// ...
	const collection = parsePublicCollectionParam(url);
	const { article, nextSlug, previousSlug } = await getPublicBlogArticleBySlug(
		orgId,
		slug,
		{ blog, collection },
	);
```

In `sitemap/+server.ts` (GET signature gains `url`):

```ts
export const GET: RequestHandler = async ({ request, url }) => {
	// ...
	const collection = parsePublicCollectionParam(url);
	const rows = await getPublicBlogArticles(orgId, { blog, limit: 200, collection });
```

- [ ] **Step 7: Full check + tests**

Run: `APP_ENV=development bunx varlock run -- bun run check && APP_ENV=development bunx varlock run -- bun test`
Expected: 0 errors; all tests pass (1250+ prior + 4 new)

- [ ] **Step 8: Commit (pull first)**

```bash
git pull && git add -A && git commit -m "feat: public blog API accepts ?collection= (customer-story joins the union)"
```

### Task 2: Replicator — importer `--collection` and `--blog` flags

**Files:**
- Modify: `slx-replicator/scripts/migrate-slx-web-blog.ts`

**Interfaces:**
- Produces: CLI flags `--collection=<c>` (default `blog`, validated against the union) and `--blog=<blogId>` (stamps `blogId` on inserted/updated articles). `findExistingArticle`, `insertArticle`, `updateArticle` become collection-aware.

- [ ] **Step 1: Add flags to `CliFlags` + `parseCli`**

```ts
interface CliFlags {
	orgId: string;
	ownerId?: string;
	sourceDir: string;
	dryRun: boolean;
	limit?: number;
	collection: BlogArticleCollection;
	blogId?: string;
}
// in parseCli defaults: collection: "blog"
// in the arg loop:
} else if (arg.startsWith("--collection=")) {
	const c = arg.slice("--collection=".length);
	if (!["blog", "news", "press", "customer-story"].includes(c)) {
		throw new Error(`Invalid --collection: ${c}`);
	}
	flags.collection = c as BlogArticleCollection;
} else if (arg.startsWith("--blog=")) {
	flags.blogId = arg.slice("--blog=".length);
}
```

- [ ] **Step 2: Use the flags in the queries**

`findExistingArticle(orgId, slug)` → `findExistingArticle(orgId, slug, collection)` replacing the hardcoded `"blog"`; `insertArticle` values gain `collection: flags.collection, blogId: flags.blogId,`; `updateArticle`'s `.set({...})` gains `blogId: flags.blogId ?? undefined`. Print `Collection :` and `Blog id    :` in the banner.

- [ ] **Step 3: Verify no regression with a blog-collection dry-run**

Run: `APP_ENV=development bunx varlock run -- bun run scripts/migrate-slx-web-blog.ts --org=org-Vm6A0J5Wt7duzc5dIU2yj --source=../lj-website/src/lib/content/blog --dry-run`
Expected: 48 articles listed, same as the blog migration

- [ ] **Step 4: CHANGELOG + version bump + commit + push**

CHANGELOG entry (next minor, e.g. 3.217.0): "Public blog API accepts optional `?collection=` (validated, default blog); importer gains `--collection` + `--blog` for the lj-website customer-stories migration; `customer-story` joins `BlogArticleCollection`." Bump `package.json` version to match.

```bash
git pull && git add -A && git commit -m "feat: importer --collection/--blog flags (3.217.0)" && git push origin main
```

Then poll until deployed: `curl -s -o /dev/null -w "%{http_code}" "https://replicator.securelogix.dev/api/public/blog/articles?collection=nope" -H "x-api-key: <LJ blog key>"` → expect `400` once live (older deploy returns 200 ignoring the param).

### Task 3: Provision the Customer Stories entity + convert JSON → md

**Files:**
- Create (scratchpad, not committed): `provision-stories-blog.ts`, `convert-stories-to-md.ts`; converted `.md` files under the scratchpad `stories-md/` dir.

**Interfaces:**
- Produces: a `blog` row (record its id + `blogk_…` key), and 21 `.md` files whose frontmatter mirrors the JSON minus `content`/`technologies` plus `status: "published"`.

- [ ] **Step 1: Provision the entity (run from slx-replicator with varlock)**

```ts
// provision-stories-blog.ts — mirrors getOrCreateDefaultBlog but non-default
import { and, eq } from "drizzle-orm";
import { db } from "/home/exedev/projects/slx-replicator/src/lib/server/db";
import { blog } from "/home/exedev/projects/slx-replicator/src/lib/server/db/schema";
import { generateId } from "/home/exedev/projects/slx-replicator/src/lib/utils/generateId";
import { generateBlogApiKey } from "/home/exedev/projects/slx-replicator/src/lib/utils/resolvePublicBlog.server";

const ORG = "org-Vm6A0J5Wt7duzc5dIU2yj";
const existing = await db
	.select()
	.from(blog)
	.where(and(eq(blog.orgId, ORG), eq(blog.slug, "customer-stories")))
	.get();
const row = existing ?? (await (async () => {
	const created = {
		id: generateId(),
		orgId: ORG,
		name: "Customer Stories",
		slug: "customer-stories",
		apiKey: generateBlogApiKey(),
		isDefault: false,
		publicUrlTemplate: "https://www.lightningjar.com/customer-stories/[slug]",
		draftUrlTemplate: "https://www.lightningjar.com/blog/preview/[token]",
	};
	await db.insert(blog).values(created);
	return created;
})());
console.log({ id: row.id, apiKey: row.apiKey });
process.exit(0);
```

Run: `cd ~/projects/slx-replicator && APP_ENV=development bunx varlock run -- bun run <scratchpad>/provision-stories-blog.ts`
Record the printed `id` (STORIES_BLOG_ID) and `apiKey` (CUSTOMER_STORIES_API_KEY value).

- [ ] **Step 2: Conversion script**

```ts
// convert-stories-to-md.ts — run from lj-website root (has `yaml` dep)
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { stringify as toYaml } from "yaml";

const SRC = "/home/exedev/projects/lj-website/src/lib/content/customer-stories";
const OUT = join(import.meta.dir, "stories-md");
mkdirSync(OUT, { recursive: true });

function htmlLinksToMd(s: string): string {
	return s.replace(
		/<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g,
		(_, href, text) => `[${text}](${href})`,
	);
}

interface Block {
	heading?: string;
	subheading?: string;
	text?: string[];
}

function blockToMd(block: Block): string {
	const out: string[] = [];
	if (block.heading) out.push(`## ${block.heading}`);
	if (block.subheading) out.push(`### ${block.subheading}`);
	let list: string[] = [];
	const flush = () => {
		if (list.length) out.push(list.join("\n"));
		list = [];
	};
	for (const raw of block.text ?? []) {
		const t = htmlLinksToMd(raw.trim());
		if (t.startsWith("• ")) list.push(`- ${t.slice(2)}`);
		else {
			flush();
			out.push(t);
		}
	}
	flush();
	return out.join("\n\n");
}

for (const f of readdirSync(SRC).filter((f) => f.endsWith(".json"))) {
	const story = JSON.parse(readFileSync(join(SRC, f), "utf-8"));
	const { content, technologies: _drop, ...fm } = story;
	fm.status = "published";
	const body = (content ?? []).map(blockToMd).join("\n\n");
	const md = `---\n${toYaml(fm)}---\n\n${body}\n`;
	writeFileSync(join(OUT, `${basename(f, ".json")}.md`), md);
	console.log(`✓ ${f}`);
}
```

Run: `cd ~/projects/lj-website && bun run <scratchpad>/convert-stories-to-md.ts`
Expected: 21 `✓` lines.

- [ ] **Step 3: Spot-check one conversion**

Read `stories-md/securelogix-digital-stack.md` end-to-end: frontmatter has `status: published`, no `content`/`technologies` keys; body has `## Customer` … `### Replicator: The AI Brand Operating System`; the "• Technology:" entries became `- Technology:` list items; the `<a href>` links became `[text](url)`.

- [ ] **Step 4: Round-trip guard**

Parse each `.md` back with the same split regex the importer uses and `yaml.parse`; deep-compare frontmatter against the source JSON minus `content`/`technologies` plus `status`. Expected: 0 diffs across 21 files. (Write this as a small `verify-conversion.ts` in the scratchpad, same pattern as the blog migration's `verify-roundtrip.ts`.)

### Task 4: Import + API verification

- [ ] **Step 1: Dry-run**

Run: `cd ~/projects/slx-replicator && APP_ENV=development bunx varlock run -- bun run scripts/migrate-slx-web-blog.ts --org=org-Vm6A0J5Wt7duzc5dIU2yj --owner=HJbHJS9OMVqV797nBccg4ICEsfT55KQy --collection=customer-story --blog=<STORIES_BLOG_ID> --source=<scratchpad>/stories-md --dry-run`
Expected: 21 slugs listed with correct titles.

- [ ] **Step 2: Live import**

Same command without `--dry-run`. Expected: `Inserted : 21, Failed : 0`.

- [ ] **Step 3: Draft tokens**

Run: `APP_ENV=development bunx varlock run -- bun run scripts/setup-blog-urls.ts --org=org-Vm6A0J5Wt7duzc5dIU2yj --skip-urls`
Expected: 21 tokens backfilled (blog articles already have theirs).

- [ ] **Step 4: Production API verification**

```bash
curl -s -H "x-api-key: <STORIES_KEY>" "https://replicator.securelogix.dev/api/public/blog/articles?collection=customer-story&limit=200" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['total'])"
# expect 21
curl -s -H "x-api-key: <LJ_BLOG_KEY>" "https://replicator.securelogix.dev/api/public/blog/articles?limit=200" | python3 -c "import json,sys; print(json.load(sys.stdin)['total'])"
# expect 48 — blog stream unchanged, no intermixing
```

Then run the round-trip verifier against the detail endpoint for 3 stories (frontmatter deep-equal to converted fm; markdown body byte-equal to the converted body).

- [ ] **Step 5: Check the repository UI doesn't intermix**

Grep `slx-replicator/src/routes/repository/blog/+page.server.ts` for its article query: if it filters `collection = "blog"` (or via the private API default), stories won't appear in the blog list — note the finding. If it doesn't filter, file the follow-up (do NOT expand scope here).

### Task 5: lj-website — env + fetch-based getter + type

**Files:**
- Modify: `lj-website/.env.schema`
- Modify: `lj-website/src/lib/types/CustomerStory.ts`
- Rewrite: `lj-website/src/lib/content/getters/getCustomerStories.ts`

**Interfaces:**
- Produces (all `fetch`-parameterized, mirroring `getBlogArticles.ts`):
  - `getAllCustomerStories(fetch): Promise<CustomerStory[]>` — order-sorted, technologies enriched, list shape (no `html`)
  - `getAllCustomerStorySlugs(fetch): Promise<string[]>`
  - `getCustomerStoryBySlug(fetch, slug): Promise<CustomerStory | undefined>` — includes `html`
  - `getNextCustomerStorySlug(fetch, slug): Promise<string | undefined>` — wrap-around
  - `getCustomerStoriesSitemapSection(fetch): Promise<SitemapSection>`

- [ ] **Step 1: Env schema entry**

```env
# Per-blog API key for the Customer Stories collection in the replicator
# CMS (second LJ blog entity), sent as `x-api-key`.
# Value loads from the 1Password environment ($OP_ENV_ID).
# @required @sensitive @type=string(startsWith="blogk_")
CUSTOMER_STORIES_API_KEY=
```

**HANDOFF: Kevin adds the value (from Task 3 Step 1) to the 1Password lj-website environment.** Until then a temporary literal in `.env.local` keeps local work green; delete it once 1Password has it.

- [ ] **Step 2: Type change**

In `CustomerStory.ts`: replace `content: ContentBlock[];` with `html?: string;` and remove the now-unused `ContentBlock` import. Run `bun run check` — expect errors only in the getter + story detail page/server (fixed next steps).

- [ ] **Step 3: Rewrite the getter**

Follow `getBlogArticles.ts` exactly for `apiBase()`/auth-header/fetch/`cache: "force-cache"` structure, with `authHeaders()` reading `ENV.CUSTOMER_STORIES_API_KEY` and every list/detail URL carrying `collection=customer-story`. List mapping: `item.frontMatter` IS the CustomerStory (minus html); sort by `(a.order ?? 999) - (b.order ?? 999)`; enrich `featuredTechnologies` → `technologies` with the existing `allTechnologies.find` logic copied verbatim. Detail: parse `markdown` with `parseMarkdownTextToHtml({ markdown, options: { sanitize: true, lazyImages: true } })` into `html`. `getNextCustomerStorySlug`: index in ordered slugs, `slugs[(index + 1) % slugs.length]`. Sitemap section: same field mapping as today (`story.meta.title`, `story.meta?.description`, href).

- [ ] **Step 4: check + commit**

`bun run check` — remaining errors must only be in consumers (Task 6). Commit getter + type + schema together with Task 6 (single working change), so no commit yet.

### Task 6: lj-website — routes + consumers

**Files:**
- Modify: `lj-website/src/routes/customer-stories/+page.server.ts` (dynamic + async getter)
- Modify: `lj-website/src/routes/customer-stories/[slug=slug]/+page.server.ts` (dynamic + detail fetch + next slug)
- Modify: `lj-website/src/routes/customer-stories/[slug=slug]/+page.svelte` (single `{@html data.html}` stream replacing the content-block loop; frontmatter hrefs/srcs through `safeLinkUrl`; run the Svelte MCP autofixer on the result)
- Modify: `lj-website/src/routes/+page.server.ts` (homepage `latestStories` from `await getAllCustomerStories(fetch)` inside `load`)
- Modify: `lj-website/src/routes/sitemap.xml/+server.ts` (`await getAllCustomerStorySlugs(fetch)` inside GET)
- Modify: `lj-website/src/routes/sitemap/+page.server.ts` (`await getCustomerStoriesSitemapSection(fetch)`)

Both story routes: `export const prerender = false;` + `setHeaders({ "cache-control": "public, s-maxage=300, stale-while-revalidate=3600" })`. Homepage stays prerendered.

- [ ] **Step 1: Update the six files** (read each before editing; keep load-return shapes identical to today except `content` → `html`)
- [ ] **Step 2: `bun run check` + `bun test`** — expect clean / all pass
- [ ] **Step 3: Baseline diff** — build once on the pre-change commit (stash), save static output; build post-change; run the tolerant normalized diff (same script family as the blog migration). Expected delta classes ONLY: story pages absent from static output (now dynamic); real `<ul>` markup; visible `<h3>` subheadings; hydration/asset noise.
- [ ] **Step 4: Local runtime verify** — `bun preview`: `/customer-stories` 200 + cache header; one story page 200 with body/testimonials/images rendered; unknown slug 404; homepage tiles + `/sitemap.xml` include stories.
- [ ] **Step 5: Commit + push** — one commit for Tasks 5+6; push `production`; poll the deploy; verify the same four URLs on www.lightningjar.com with `x-vercel-cache` present.

### Task 7: Cleanup + docs

- [ ] **Step 1:** Delete `src/lib/content/customer-stories/*.json` (21 files); getter no longer globs, so `bun run check`/`bun test`/`bun run build` must stay green. Delete scratchpad `stories-md/`.
- [ ] **Step 2:** Update `lj-website/CLAUDE.md` Content System section: customer stories now live in the replicator CMS (collection `customer-story`, Customer Stories blog entity), no longer JSON-in-git.
- [ ] **Step 3:** Update the migration memory file (`blog-cms-migration-state.md`) with the stories entity id/key location + shipped state.
- [ ] **Step 4:** Commit + push; production spot-check one story URL end-to-end.
