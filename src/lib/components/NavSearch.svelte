<script lang="ts">
import { goto } from "$app/navigation";

import {
	filterSearchIndex,
	groupSearchResults,
	loadSearchIndex,
	type SearchRecord,
} from "$utils/siteSearch";

interface Props {
	// desktop: icon button opening a dropdown panel; mobile: inline
	// input + results (rendered inside the hamburger popover)
	variant?: "desktop" | "mobile";
	// called when a result is chosen (mobile uses this to close the popover)
	onNavigate?: () => void;
}

let { variant = "desktop", onNavigate }: Props = $props();

let open = $state(false);
let query = $state("");
let records: SearchRecord[] = $state([]);
let inputEl: HTMLInputElement | null = $state(null);

let results = $derived(filterSearchIndex(records, query));
let groups = $derived(groupSearchResults(results));

async function ensureIndex() {
	records = await loadSearchIndex();
}

function openPanel() {
	open = true;
	ensureIndex();
}

function close() {
	open = false;
	query = "";
}

function choose() {
	close();
	onNavigate?.();
}

function handleToggleClick() {
	if (open) {
		close();
	} else {
		openPanel();
	}
}

// Enter jumps to the top result
function handleInputKeydown(e: KeyboardEvent) {
	if (e.key === "Enter" && results[0]) {
		e.preventDefault();
		const url = results[0].url;
		choose();
		goto(url);
	}
}

function handleFocusOut(e: FocusEvent) {
	const container = e.currentTarget as HTMLElement;
	if (!container.contains(e.relatedTarget as Node)) close();
}

function handleWindowClick(e: MouseEvent) {
	if (!open) return;
	const target = e.target as HTMLElement | null;
	if (!target?.closest("[data-nav-search]")) close();
}

function handleWindowKeydown(e: KeyboardEvent) {
	if (e.key === "Escape") close();
}

$effect(() => {
	if (open) inputEl?.focus();
});
</script>

{#snippet searchResults()}
  {#each groups as group}
    <div
      class="text-13px uppercase tracking-wide text-maximumYellow opacity-90 mt-3 mb-1 px-2"
    >
      {group.label}
    </div>
    {#each group.items as item}
      <a
        href={item.url}
        title={item.blurb || item.title}
        class="block px-2 py-1.5 rounded-sm leading-snug opacity-90 hover:(opacity-100 text-accent bg-white/5)"
        onclick={choose}
      >
        {item.title}
      </a>
    {/each}
  {/each}
  {#if query.trim() && !results.length}
    <p class="px-2 pt-3 opacity-80">No results for “{query.trim()}”.</p>
  {/if}
{/snippet}

<svelte:window onclick={handleWindowClick} onkeydown={handleWindowKeydown} />

{#if variant === "desktop"}
  <div class="relative" data-nav-search onfocusout={handleFocusOut}>
    <button
      type="button"
      aria-label="Search this site"
      aria-expanded={open}
      class="flex items-center opacity-90 hover:(opacity-100 text-accent) {open
        ? 'text-accent opacity-100'
        : ''}"
      onclick={handleToggleClick}
    >
      <svg
        class="w-4.5 h-4.5"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        aria-hidden="true"
      >
        <circle cx="8.5" cy="8.5" r="5.75" />
        <path d="M13 13 L17.5 17.5" />
      </svg>
    </button>
    {#if open}
      <div
        class="absolute right-0 top-full mt-3 w-[22rem] max-h-[70vh] overflow-y-auto rounded-sm border border-white/14 bg-oxfordDark p-3 shadow-lg z-10"
      >
        <input
          bind:this={inputEl}
          bind:value={query}
          onkeydown={handleInputKeydown}
          type="search"
          placeholder="Search articles, studies, stories…"
          aria-label="Search this site"
          class="w-full rounded-sm border border-white/14 bg-white/5 px-3 py-1.5 placeholder:opacity-60"
        />
        {@render searchResults()}
      </div>
    {/if}
  </div>
{:else}
  <div class="w-full" data-nav-search>
    <input
      bind:value={query}
      onfocus={ensureIndex}
      onkeydown={handleInputKeydown}
      type="search"
      placeholder="Search articles, studies, stories…"
      aria-label="Search this site"
      class="w-full rounded-sm border border-white/14 bg-white/5 px-3 py-2 placeholder:opacity-60"
    />
    <div class="max-h-[40vh] overflow-y-auto">
      {@render searchResults()}
    </div>
  </div>
{/if}
