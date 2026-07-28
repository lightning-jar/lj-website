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

// unique tags across all entries, alphabetized
const allTags = $derived(
	uniqueSortedTags(data.articles.map((a) => a.tags as string[] | undefined)),
);

// every search term must match somewhere (title, author, publication,
// summary, excerpt, or a tag — same spirit as the blog, which also
// matches fields the list doesn't display)
const searchTerms = $derived(searchTermsOf(search));

const filteredArticles = $derived(
	data.articles.filter((article) =>
		matchesEveryTerm(
			[
				article.title ?? "",
				article.author?.name ?? "",
				article.source?.publicationName ?? "",
				article.summary ?? "",
				article.excerpt ?? "",
				...(article.tags ?? []),
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
    href="/reading-list/atom.xml"
    rel="alternate"
    title="Lightning Jar — Reading List"
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
        <h1 class="display">
          {data.banner?.heading}
        </h1>
        <p class="max-w-prose mb-5 empty:hidden">
          {data.banner?.subheading ?? ""}
        </p>
      </header>
      <FeedBadge href="/reading-list/atom.xml" />
    </div>
  {/if}

  <div class="flex flex-col gap-4">
    <SearchTagFilter
      bind:search
      label="Search the reading list"
      {allTags}
      {searchTerms}
      {toggleTag}
    />
  </div>

  {#if search.trim()}
    <p class="text-14px text-current/70">
      {filteredArticles.length}
      {filteredArticles.length === 1 ? "entry" : "entries"}
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
    <h2 class="sr-only">Select an Entry Below to Read More</h2>
    {#each filteredArticles as article, index (article.slug)}
      {#if index !== 0}
        <hr class="mb-5 opacity-40" />
      {/if}
      <article
        class="max-w-article mb-5 content-auto-480 scroll-mt-24"
        id={article.slug}
      >
        <!-- title, linking to the entry's detail page -->
        <h3 class="text-20px font-700 font-serif mb-1">
          <a
            class="text-maximumYellow opacity-90 hover:opacity-100 underline-offset-4 hover:underline"
            href="/reading-list/{article.slug}"
          >
            {article?.title}
          </a>
        </h3>

        <!-- meta -->
        <div class="flex flex-wrap text-slate-100/80 gap-2 items-baseline">
          <!-- author -->
          {#if article?.author?.name}
            <!-- linked  -->
            {#if article?.author?.url}
              <a href={article?.author.url} rel="external"
                >{article?.author?.name}</a
              >
            {:else}
              <div>{article?.author?.name}</div>
            {/if}
          {/if}

          <!-- publisher -->
          {#if article?.source.publicationName}
            {#if article?.source.publicationUrl}
              <a href={article?.source.publicationUrl} rel="external"
                >{article?.source.publicationName}</a
              >
            {:else}
              <div>{article?.source.publicationName}</div>
            {/if}
          {/if}
          <!-- date -->
          {#if article?.publishDate}
            <span>{article?.publishDate}</span>
          {/if}

          <!-- tags: toggle into the search filter -->
          {#if article.tags?.[0]}
            <span class="flex flex-wrap gap-2 text-0.9em text-accent">
              {#each article.tags as tag (tag)}
                <button
                  type="button"
                  onclick={() => toggleTag(tag)}
                  class="opacity-90 hover:opacity-100 hover:underline underline-offset-2"
                  aria-pressed={tagIsActive(searchTerms, tag)}
                >
                  #{tag}
                </button>
              {/each}
            </span>
          {/if}
        </div>
      </article>
    {:else}
      <p class="text-current/70 py-8">
        No entries match your search.
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
