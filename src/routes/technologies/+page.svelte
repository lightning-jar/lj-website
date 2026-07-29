<script lang="ts">
// components
import SearchTagFilter from "$components/SearchTagFilter.svelte";
import {
	matchesEveryTerm,
	searchTermsOf,
	toggleSearchTerm,
} from "$utils/searchFilter";

let { data } = $props();

// search (blog-page pattern; supercategory chips act as tag shortcuts)
let search = $state("");
const searchTerms = $derived(searchTermsOf(search));

const allTags = $derived(
	(data?.supercategories ?? []).map((sc) => sc.shortName || sc.name),
);

// supercategory names join the haystack so the chips (and typed
// category words) match every technology in that section
const scNameById = $derived(
	new Map(
		(data?.supercategories ?? []).map((sc) => [
			sc.id,
			`${sc.shortName ?? ""} ${sc.name}`,
		]),
	),
);

const filteredTechnologies = $derived(
	(data?.technologies ?? []).filter((tech) =>
		matchesEveryTerm(
			[
				tech.name,
				tech.category ?? "",
				tech.shortDescription ?? "",
				scNameById.get(tech.supercategory ?? "") ?? "",
			],
			searchTerms,
		),
	),
);

// sections with no matching technologies are hidden
const visibleSections = $derived(
	(data?.supercategories ?? []).filter((sc) =>
		filteredTechnologies.some((tech) => tech.supercategory === sc.id),
	),
);

function toggleTag(tag: string) {
	search = toggleSearchTerm(search, tag);
}
</script>

<main id="main">
<header class="page-x-padding main-y-padding !pb-8">
  <h1 class="display max-w-article">
    {data?.banner.heading}
  </h1>
  <p class="max-w-article">{data?.banner.subheading}</p>

  <div class="flex flex-col gap-4 mt-6">
    <SearchTagFilter
      bind:search
      label="Search technologies"
      {allTags}
      {searchTerms}
      {toggleTag}
    />
  </div>
  {#if search.trim()}
    <p class="mt-3 text-14px text-current/70">
      {filteredTechnologies.length}
      {filteredTechnologies.length === 1
        ? "technology matches"
        : "technologies match"}
    </p>
  {/if}
</header>

<div
  class="page-x-padding pb-24 grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8"
>
  <div class="list-decimal grid grid-cols-1 gap-8 opacity-90 max-w-article">
    {#each visibleSections as section, sectionIndex}
      <section class="grid grid-cols-1">
        <h2 class="heading-2" id={section.id}>
          {sectionIndex + 1}. {section.name}
        </h2>
        <p class="mb-5">{section.description}</p>
        <div class="grid grid-cols-1">
          {#each filteredTechnologies.filter((tech) => tech.supercategory === section.id) as technology}
            <a
              href="/technologies/{technology.id}"
              class="group border-t border-slate-100/15 last:border-b flex flex-wrap items-baseline gap-x-3 gap-y-1 py-3"
            >
              <span
                class="text-maximumYellow/70 group-hover:translate-x-1 transition-transform mr-1 select-none"
                aria-hidden="true">&rsaquo;</span
              >
              <h3
                id={technology.id}
                class="text-19px font-serif text-maximumYellow font-700 opacity-95 scroll-mt-24 group-hover:opacity-100 group-hover:underline decoration-maximumYellow/40 underline-offset-4"
              >
                {technology.name}
              </h3>
              <span class="opacity-80 italic text-15px">
                {technology.category}
              </span>
              <span class="w-full opacity-70 text-15px leading-snug">
                {technology.shortDescription}
              </span>
            </a>
          {/each}
        </div>
      </section>
    {/each}
  </div>

  <!--sidebar -->
  <aside class="hidden lg:flex justify-end">
    <div class="max-w-400px w-full">
      <!-- jump links to sections -->
      <nav aria-label="Technology categories" class="flex gap-4 flex-wrap mb-8">
        <h2
          class="text-22px font-serif text-maximumYellow font-700 sm:mb-0 mb-3 sr-only"
        >
          Technologies Topics
        </h2>
        {#each visibleSections as supercategory}
          <a
            href={`#${supercategory.id}`}
            class="text-maximumYellow px-3 py-2 rounded border border-current leading-none text-14px opacity-95 hover:opacity-100"
          >
            {supercategory?.shortName || supercategory?.name}
          </a>
        {/each}
      </nav>

      <!-- list by name  -->
      <nav aria-label="Technology categories sidebar" class="border px-3 pt-4 pb-5 rounded border-slate-100/60 max-h-fit">
        <h2
          class="text-22px font-serif text-maximumYellow font-700 sm:mb-0 mb-3 sr-only"
        >
          Technologies by Name
        </h2>

        <ul class="grid grid-cols-1 gap-3 pl-0 ml-0">
          {#each filteredTechnologies as technology}
            <li class="leading-tight">
              <a
                href="/technologies/{technology.id}"
                class="opacity-90 underline decoration-current hover:(text-maximumYellow opacity-100) underline-offset-4"
              >
                {technology.name}
              </a>
            </li>
          {/each}
        </ul>
      </nav>
    </div>
  </aside>
</div>
</main>
