<script lang="ts">
// components
import FeedBadge from "$components/FeedBadge.svelte";
import SearchTagFilter from "$components/SearchTagFilter.svelte";

// utils
import {
	matchesEveryTerm,
	searchTermsOf,
	tagIsActive,
	toggleSearchTerm,
	uniqueSortedTags,
} from "$utils/searchFilter";

let { data } = $props();

let search = $state("");

// filterable facets: areas and projects join the explicit tags, so one
// click narrows the series to "Web Audio" or "Stem Shovel"
const allTags = $derived(
	uniqueSortedTags(
		data.findings.map((f) =>
			[f.area, f.project, ...(f.tags ?? [])].filter(
				(t): t is string => typeof t === "string" && t.length > 0,
			),
		),
	),
);

const searchTerms = $derived(searchTermsOf(search));

const filteredFindings = $derived(
	data.findings.filter((finding) =>
		matchesEveryTerm(
			[
				finding.title ?? "",
				finding.description ?? "",
				finding.area ?? "",
				finding.project ?? "",
				String(finding.number ?? ""),
				...(finding.tags ?? []),
			],
			searchTerms,
		),
	),
);

function toggleTag(tag: string) {
	search = toggleSearchTerm(search, tag);
}

function clearFilters() {
	search = "";
}
</script>

<svelte:head>
  <link
    href="/findings/atom.xml"
    rel="alternate"
    title="Lightning Jar — Findings"
    type="application/atom+xml"
  />
</svelte:head>

<main
  id="main"
  class="page-x-padding main-y-padding pb-6 grid grid-cols-1 gap-8 min-h-screen place-content-start"
>
  {#if data?.banner}
    <div class="flex items-start justify-between gap-4">
      <header class="max-w-prose">
        <h1 class="heading-1">
          {data.banner?.heading}
        </h1>
        <p class="max-w-prose mb-5 empty:hidden">
          {data.banner?.subheading ?? ""}
        </p>
      </header>
      <FeedBadge href="/findings/atom.xml" />
    </div>
  {/if}

  <div class="flex flex-col gap-4">
    <SearchTagFilter
      bind:search
      label="Search the findings"
      {allTags}
      {searchTerms}
      {toggleTag}
    />
  </div>

  {#if search.trim()}
    <p class="text-14px text-current/70">
      {filteredFindings.length}
      {filteredFindings.length === 1 ? "finding" : "findings"}
      <button
        type="button"
        onclick={clearFilters}
        class="ml-2 underline underline-offset-2 hover:text-accent"
      >
        Clear filters
      </button>
    </p>
  {/if}

  <div>
    <h2 class="sr-only">Select a Finding Below to Read More</h2>
    {#each filteredFindings as finding, index (finding.slug)}
      {#if index !== 0}
        <hr class="mb-5 opacity-40" />
      {/if}
      <article
        class="max-w-article mb-5 content-auto-480 scroll-mt-24"
        id={finding.slug}
      >
        <!-- eyebrow: series number -->
        {#if finding.number}
          <p class="text-12px tracking-wide uppercase opacity-70">
            Findings No. {finding.number}
          </p>
        {/if}

        <!-- the claim, linking to the entry's detail page -->
        <h3 class="text-20px font-700 font-serif mb-1">
          <a
            class="text-maximumYellow opacity-90 hover:opacity-100 underline-offset-4 hover:underline"
            href="/findings/{finding.slug}"
          >
            {finding?.title}
          </a>
        </h3>

        {#if finding.description}
          <p class="text-slate-100/80 mb-1 max-w-prose">
            {finding.description}
          </p>
        {/if}

        <!-- meta -->
        <div class="flex flex-wrap text-slate-100/80 gap-2 items-baseline">
          {#if finding.verified}
            <time datetime={finding.verified}>{finding.verified}</time>
          {/if}

          <!-- facets: toggle into the search filter -->
          <span class="flex flex-wrap gap-2 text-0.9em text-accent">
            {#each [...new Set([finding.area, finding.project, ...(finding.tags ?? [])].filter((t) => typeof t === "string" && t.length > 0))] as tag (tag)}
              <button
                type="button"
                onclick={() => toggleTag(tag as string)}
                class="opacity-90 hover:opacity-100 hover:underline underline-offset-2"
                aria-pressed={tagIsActive(searchTerms, tag as string)}
              >
                #{tag}
              </button>
            {/each}
          </span>
        </div>
      </article>
    {:else}
      {#if data.findings.length === 0}
        <p class="text-current/70 py-8">
          The first entries in the Findings series are on their way.
        </p>
      {:else}
        <p class="text-current/70 py-8">
          No findings match your search.
          <button
            type="button"
            onclick={clearFilters}
            class="underline underline-offset-2 hover:text-accent"
          >
            Clear filters
          </button>
        </p>
      {/if}
    {/each}
  </div>
</main>
