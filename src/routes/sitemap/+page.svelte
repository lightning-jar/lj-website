<!--
@component
Sitemap page
-->
<script lang="ts">
// components
import SearchTagFilter from "$components/SearchTagFilter.svelte";
import { matchesEveryTerm, searchTermsOf } from "$utils/searchFilter";

// data
let { data } = $props();

// search (blog-page pattern, minus tags: the box is the whole filter)
let search = $state("");
const searchTerms = $derived(searchTermsOf(search));

// every search term must match somewhere (href, title, description, or
// the section name); sections with no matching pages are hidden
const filteredSitemap = $derived(
	data.sitemap
		.map((section) => ({
			...section,
			pages: section.pages.filter((page) =>
				matchesEveryTerm(
					[
						page.href ?? "",
						page.title ?? "",
						page.description ?? "",
						section.name,
					],
					searchTerms,
				),
			),
		}))
		.filter((section) => section.pages.length > 0),
);

// count all visible pages
let pagesCount = $derived.by(() => {
	let count = 0;
	for (const section of filteredSitemap) {
		count += section.pages.length;
	}
	return count;
});
</script>

<!-- <PageBanner
  {eyebrow}
  headline="Sitemap"
  text="A directory of pages on this website."
></PageBanner> -->

<main class="page-x-padding main-y-padding font-mono text-15px">
  <div class="mb-10">
    <SearchTagFilter
      bind:search
      label="Search pages"
      allTags={[]}
      {searchTerms}
      toggleTag={() => {}}
    />
    {#if search.trim()}
      <p class="mt-3 text-14px text-current/70">
        {pagesCount}
        {pagesCount === 1 ? "page matches" : "pages match"}
      </p>
    {/if}
  </div>

  <section class="mb-16">
    <div class="flex items-baseline gap-4">
      <h2 class="font-800 text-[1.25rem] mb-4">All Sections</h2>
      <span>- {pagesCount} pages</span>
    </div>
    <ul class="grid grid-cols-1 gap-4">
      {#each filteredSitemap as section}
        <li>
          <a
            class="underline underline-offset-4 decoration-richBlack/40 opacity-90 hover:opacity-100 hover:decoration-current"
            href={`#${section.name.toLowerCase().replace(/ /g, "-")}`}
            >{section.name}</a
          >
          <span> - {section.pages.length}</span>
        </li>
      {/each}
    </ul>
  </section>

  <h2 class="lj-section-heading sr-only">Pages</h2>

  <div
    class="w-full grid grid-cols-1 gap-16 place-content-start place-items-start"
  >
    {#each filteredSitemap as section}
      <section
        class="w-full"
        id={section.name.toLowerCase().replace(/ /g, "-")}
      >
        <div class="flex gap-4 items-baseline mb-6">
          <h3 class="font-800 text-[1.25rem]">{section.name}</h3>
          <span>-</span>
          <span>{section.pages.length} pages</span>
        </div>

        <ul class="grid grid-cols-1 gap-y-8 lg:gap-3">
          {#each section.pages as page}
            <li
              class="grid gap-2 grid-cols-1 lg:grid-cols-[480px_1fr_auto] lg:gap-8"
            >
              <a
                class="
                    underline
                    underline-offset-4
                    decoration-richBlack/40
                    opacity-90
                    truncate
                    hover:opacity-100
                    hover:decoration-current"
                href={page.href}>{page.href}</a
              >
              <div class="truncate">{page.title}</div>
              {#if page.date}
                {@const date = new Date(page.date)
                  .toISOString()
                  .split("T")?.[0]}
                <time class="inline-block truncate" datetime={page.date}
                  >{date}</time
                >
              {/if}
            </li>
          {/each}
        </ul>
      </section>
    {/each}
  </div>
</main>
