<script lang="ts">
// types
interface ReadingCard {
	slug: string;
	title: string;
	publication: string;
}
interface Props {
	entries?: ReadingCard[];
}

// props
let { entries = [] }: Props = $props();
</script>

{#if entries.length}
  <section class="page-x-padding py-12 border-t border-white/10 w-full">
    <div class="flex items-end justify-between gap-4 mb-6">
      <h2 class="heading-2">Latest Reading List</h2>
      <a
        href="/reading-list"
        aria-label="View all reading list entries"
        class="text-maximumYellow hover:underline text-15px whitespace-nowrap"
        >View all →</a
      >
    </div>

    <div
      class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-5"
    >
      {#each entries as entry, index}
        <a
          aria-labelledby="latest-reading-{index}"
          href="/reading-list/{entry.slug}"
          title={entry.title}
          class="{index === 5
            ? 'lg:hidden xl:flex'
            : ''} aspect-[4/3] w-full border border-current rounded-lg overflow-hidden relative flex flex-col justify-between gap-2 p-3 hover:bg-white/5"
        >
          <div
            class="text-maximumYellow text-13px uppercase tracking-wide truncate"
          >
            {entry.publication}
          </div>
          <h3
            id="latest-reading-{index}"
            class="font-sans font-400 leading-snug text-15px sm:text-16px line-clamp-4"
          >
            {entry.title}
          </h3>
        </a>
      {/each}
    </div>
  </section>
{/if}
