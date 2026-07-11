<script lang="ts">
// components
import LinkButton from "$components/LinkButton.svelte";

let { data } = $props();

let search = $state("");
let showTags = $state(false);

// unique tags across all stories, alphabetized
const allTags = $derived(
	[
		...new Set(
			(data.stories ?? []).flatMap(
				(s: (typeof data.stories)[number]) => s.tags ?? [],
			),
		),
	].sort((a, b) => a.localeCompare(b)),
);

// the search box is the single source of truth: split it into terms and
// require every term to match somewhere (heading, subtitle, excerpt,
// customer, category, or a tag)
const searchTerms = $derived(search.toLowerCase().split(/\s+/).filter(Boolean));

const filteredStories = $derived(
	(data.stories ?? []).filter((story: (typeof data.stories)[number]) => {
		const haystack = [
			story.banner?.heading ?? "",
			story.banner?.subtitle ?? "",
			story.excerpt ?? "",
			story.customer?.name ?? "",
			story.customer?.category ?? "",
			...(story.tags ?? []),
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

<div
  class="page-x-padding main-y-padding pb-6 grid grid-cols-1 gap-12 min-h-screen place-content-start"
>
  {#if data?.banner}
    <header class="max-w-prose">
      <h1 class="display">
        {data.banner?.heading}
      </h1>
      <p class="max-w-prose mb-5 empty:hidden">
        {data.banner?.subheading ?? ""}
      </p>
    </header>
  {/if}

  <div class="flex flex-col gap-4">
    <label class="relative block max-w-md">
      <span class="sr-only">Search customer stories</span>
      <input
        type="search"
        bind:value={search}
        placeholder="Search customer stories"
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
    <main>
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
    </main>

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
</div>
