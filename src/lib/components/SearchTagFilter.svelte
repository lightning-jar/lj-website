<script lang="ts">
// Search input + collapsible tag-chip shortcuts for listing pages.
// The parent owns the search string (bind:search) and the filtering;
// term/toggle helpers live in $utils/searchFilter.
import { tagIsActive } from "$utils/searchFilter";

interface Props {
	search: string;
	label: string;
	allTags: string[];
	searchTerms: string[];
	toggleTag: (tag: string) => void;
}

// props
let {
	search = $bindable(),
	label,
	allTags,
	searchTerms,
	toggleTag,
}: Props = $props();

let showTags = $state(false);

// how many known tags are currently active in the search box (for the badge)
const activeTagCount = $derived(
	allTags.filter((tag) => tagIsActive(searchTerms, tag)).length,
);
</script>

<label class="relative block max-w-md">
  <span class="sr-only">{label}</span>
  <input
    type="search"
    bind:value={search}
    placeholder={label}
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
            aria-pressed={tagIsActive(searchTerms, tag)}
            onclick={() => toggleTag(tag)}
            class="rounded-full border border-current px-3 py-1 text-13px transition-colors hover:border-accent {tagIsActive(
              searchTerms,
              tag,
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
