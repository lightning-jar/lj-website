<script lang="ts">
// components
import FeedBadge from "$components/FeedBadge.svelte";
import LinkButton from "$components/LinkButton.svelte";
import SearchTagFilter from "$components/SearchTagFilter.svelte";
import {
	matchesEveryTerm,
	searchTermsOf,
	toggleSearchTerm,
	uniqueSortedTags,
} from "$utils/searchFilter";

let { data } = $props();

let search = $state("");

// unique tags across all stories, alphabetized
const allTags = $derived(
	uniqueSortedTags(
		(data.stories ?? []).map((s: (typeof data.stories)[number]) => s.tags),
	),
);

// every search term must match somewhere (heading, subtitle, excerpt,
// customer, category, or a tag)
const searchTerms = $derived(searchTermsOf(search));

const filteredStories = $derived(
	(data.stories ?? []).filter((story: (typeof data.stories)[number]) =>
		matchesEveryTerm(
			[
				story.banner?.heading ?? "",
				story.banner?.subtitle ?? "",
				story.excerpt ?? "",
				story.customer?.name ?? "",
				story.customer?.category ?? "",
				...(story.tags ?? []),
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

<main
  id="main"
  class="page-x-padding main-y-padding pb-6 grid grid-cols-1 gap-12 min-h-screen place-content-start"
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
      <FeedBadge href="/customer-stories/atom.xml" />
    </div>
  {/if}

  <div class="flex flex-col gap-4">
    <SearchTagFilter
      bind:search
      label="Search customer stories"
      {allTags}
      {searchTerms}
      {toggleTag}
    />

    {#if search.trim()}
      <p class="text-14px text-current/70">
        {filteredStories.length}
        {filteredStories.length === 1 ? "story" : "stories"}
        <button
          type="button"
          onclick={clearFilters}
          class="ml-2 underline underline-offset-2 hover:text-accent"
        >
          Clear filters
        </button>
      </p>
    {/if}
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-12">
    <div>
      <h2 class="sr-only">Select a Customer Story Below to Read More</h2>
    {#each filteredStories as story}
      <article class="max-w-article mb-10">
        {#if story?.thumbnailImage}
          <img
            src={story.thumbnailImage.src}
            alt="{story.customer.name} Logo"
            loading="lazy"
            class="aspect-[5/4] object-cover mb-4 h-160px w-200px rounded overflow-hidden"
          />
        {/if}
        <h3 class="text-24px font-700 font-serif text-maximumYellow mb-3">
          {story?.banner.heading}
          {#if story?.banner.subtitle}
            <span
              class="block text-15px font-400 font-sans text-cultured opacity-85 mt-1 leading-snug"
            >
              {story.banner.subtitle}
            </span>
          {/if}
        </h3>

        <div class="mb-5 w-full">
          <div class="w-full opacity-90">
            {story?.excerpt ?? "No excerpt available."}
          </div>

          {#if story.tags?.[0]}
            <div class="mt-2 flex flex-wrap gap-2 text-0.9em text-accent">
              {#each story.tags as tag}
                <button
                  type="button"
                  onclick={() => toggleTag(tag)}
                  class="opacity-90 hover:opacity-100 cursor-pointer"
                  >#{tag}</button
                >
              {/each}
            </div>
          {/if}
        </div>

        {#if story.slug}
          <!-- <a
            class="button-accent"
            title="read full story"
            href="/customer-stories/{story.slug ?? ''}">Read Story</a
          > -->

          <LinkButton
            classes="button-accent"
            link={{
              href: `/customer-stories/${story.slug ?? ""}`,
              title: "read full story",
            }}
          >
            Read Story
          </LinkButton>
        {/if}
      </article>
    {:else}
      <p class="text-current/70 py-8">
        No customer stories match your search.
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

    {#if data?.clients?.length}
      <aside>
        <h2 class="text-18px font-700 font-serif text-maximumYellow mb-4">
          Customers Past &amp; Present
        </h2>
        <ul
          class="grid grid-cols-2 lg:grid-cols-1 gap-x-6 gap-y-1.5 text-14px opacity-85"
        >
          {#each data.clients as client}
            <li>{client}</li>
          {/each}
        </ul>
      </aside>
    {/if}
  </div>
</main>
