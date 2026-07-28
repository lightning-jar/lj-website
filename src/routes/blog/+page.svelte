<script lang="ts">
import FeedBadge from "$components/FeedBadge.svelte";
import SearchTagFilter from "$components/SearchTagFilter.svelte";
import {
	matchesEveryTerm,
	searchTermsOf,
	toggleSearchTerm,
	uniqueSortedTags,
} from "$utils/searchFilter";

let { data } = $props();

let search = $state("");

// unique tags across all articles, alphabetized
const allTags = $derived(
	uniqueSortedTags(data.articles.map((a) => a.tags as string[] | undefined)),
);

// every search term must match somewhere (title, description, or a tag)
const searchTerms = $derived(searchTermsOf(search));

const filteredArticles = $derived(
	data.articles.filter((article) =>
		matchesEveryTerm(
			[
				article.title ?? "",
				article.description ?? "",
				...((article.tags as string[] | undefined) ?? []),
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
    href="/blog/atom.xml"
    rel="alternate"
    title="Lightning Jar — Blog"
    type="application/atom+xml"
  />
</svelte:head>

<main
  id="main"
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
    <SearchTagFilter
      bind:search
      label="Search articles"
      {allTags}
      {searchTerms}
      {toggleTag}
    />
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

  <div
    class="grid max-w-420px sm-max-w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5"
  >
    {#each filteredArticles as article, index}
      <a
        aria-labelledby="title-{article.slug}"
        href="blog/{article.slug}"
        class="aspect-[4/3] w-full border border-current rounded-lg overflow-hidden relative"
      >
        <!-- Meaningful alt from the article's imageDescription when set;
             otherwise stay decorative (empty alt + aria-hidden) since the
             link is already labeled by the title. First-row images load
             eagerly (one is the LCP element); the rest stay lazy. -->
        <img
          aria-hidden={article.imageDescription ? undefined : "true"}
          src={article.image}
          alt={article.imageDescription ?? ""}
          class="w-full !h-full object-cover"
          loading={index < 3 ? "eager" : "lazy"}
          fetchpriority={index === 0 ? "high" : undefined}
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
  </div>
</main>
