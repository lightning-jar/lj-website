<script lang="ts">
import FeedBadge from "$components/FeedBadge.svelte";

let { data } = $props();

let search = $state("");
let showTags = $state(false);

// unique tags across all articles, alphabetized
const allTags = $derived(
	[
		...new Set(
			data.articles.flatMap((a) => (a.tags as string[] | undefined) ?? []),
		),
	].sort((a, b) => a.localeCompare(b)),
);

// the search box is the single source of truth: split it into terms and
// require every term to match somewhere (title, description, or a tag)
const searchTerms = $derived(search.toLowerCase().split(/\s+/).filter(Boolean));

const filteredArticles = $derived(
	data.articles.filter((article) => {
		const haystack = [
			article.title,
			article.description,
			...((article.tags as string[] | undefined) ?? []),
		]
			.join(" ")
			.toLowerCase();

		return searchTerms.every((term) => haystack.includes(term));
	}),
);

// how many known tags are currently active in the search box (for the badge)
const activeTagCount = $derived(
	allTags.filter((tag) => searchTerms.includes(tag.toLowerCase())).length,
);

// chips are just shortcuts that add or remove their term in the search box
function toggleTag(tag: string) {
	const term = tag.toLowerCase();
	if (searchTerms.includes(term)) {
		search = searchTerms.filter((t) => t !== term).join(" ");
	} else {
		search = [...searchTerms, term].join(" ");
	}
}

function clearFilters() {
	search = "";
}
</script>

<svelte:head>
  <link
    href="/blog/atom.xml"
    rel="alternate"
    title="Lightning Jar — Blog"
    type="application/atom+xml"
  />
</svelte:head>

<div
  class="page-x-padding min-h-screen pt-8 pb-8 grid gird-cols-1 min-h-screen place-content-start"
>
  <div class="flex items-start justify-between gap-4 mb-8">
    <header class="max-w-prose">
      <h1 class="display">{data?.meta?.title || "Blog"}</h1>
      <p>
        {data?.meta?.description || ""}
      </p>
      <h2 class="sr-only">Articles</h2>
    </header>
    <FeedBadge href="/blog/atom.xml" />
  </div>

  <div class="flex flex-col gap-4 mb-8">
    <label class="relative block max-w-md">
      <span class="sr-only">Search articles</span>
      <input
        type="search"
        bind:value={search}
        placeholder="Search articles"
        class="w-full rounded-lg border border-current bg-oxfordDark/40 px-4 py-2 text-15px placeholder:text-current/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
      />
    </label>

    {#if allTags.length}
      <div class="flex flex-col gap-3">
        <button
          type="button"
          aria-expanded={showTags}
          aria-controls="tag-filters"
          onclick={() => (showTags = !showTags)}
          class="flex items-center gap-1.5 self-start text-14px text-current/80 hover:text-accent"
        >
          <span
            aria-hidden="true"
            class="inline-block transition-transform {showTags
              ? 'rotate-90'
              : ''}">›</span
          >
          Filter by tag{activeTagCount ? ` (${activeTagCount})` : ""}
        </button>

        {#if showTags}
          <div id="tag-filters" class="flex flex-wrap items-center gap-2">
            {#each allTags as tag}
              <button
                type="button"
                aria-pressed={searchTerms.includes(tag.toLowerCase())}
                onclick={() => toggleTag(tag)}
                class="rounded-full border border-current px-3 py-1 text-13px transition-colors hover:border-accent {searchTerms.includes(
                  tag.toLowerCase(),
                )
                  ? 'bg-accent text-oxford border-accent font-600'
                  : 'text-current/80'}"
              >
                {tag}
              </button>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  </div>

  {#if search.trim()}
    <p class="mb-4 text-14px text-current/70">
      {filteredArticles.length}
      {filteredArticles.length === 1 ? "article" : "articles"}
      <button
        type="button"
        onclick={clearFilters}
        class="ml-2 underline underline-offset-2 hover:text-accent"
      >
        Clear filters
      </button>
    </p>
  {/if}

  <main
    class="grid max-w-420px sm-max-w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5"
  >
    {#each filteredArticles as article}
      <a
        aria-labelledby="title-{article.slug}"
        href="blog/{article.slug}"
        class="aspect-[4/3] w-full border border-current rounded-lg overflow-hidden relative"
      >
        <img
          aria-hidden="true"
          src={article.image}
          alt=""
          class="w-full !h-full object-cover"
          loading="lazy"
        />
        <h3
          id="title-{article.slug}"
          class="px-3 absolute bottom-0 flex backdrop-blur bg-oxfordDark/80 w-full py-2 font-serif font-700 text-17px"
        >
          {article.title}
        </h3>
      </a>
    {:else}
      <p class="col-span-full text-current/70 py-8">
        No articles match your search.
        <button
          type="button"
          onclick={clearFilters}
          class="underline underline-offset-2 hover:text-accent"
        >
          Clear filters
        </button>
      </p>
    {/each}
  </main>
</div>
