<script lang="ts">
// types
interface StudyCard {
	slug: string;
	letters: string;
	title: string;
}
interface Props {
	studies?: StudyCard[];
}

// props
let { studies = [] }: Props = $props();
</script>

{#if studies.length}
  <section class="page-x-padding py-12 border-t border-white/10 w-full">
    <div class="flex items-end justify-between gap-4 mb-6">
      <h2 class="heading-2">Latest Research</h2>
      <a
        href="/research/barkup-bench"
        class="text-maximumYellow hover:underline text-15px whitespace-nowrap"
        >View all →</a
      >
    </div>

    <div
      class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-5"
    >
      {#each studies as study, index}
        <a
          aria-labelledby="latest-study-{study.slug}"
          href="/research/barkup-bench/{study.slug}"
          title={study.title}
          class="{index === 5
            ? 'lg:hidden xl:flex'
            : ''} aspect-[4/3] w-full border border-current rounded-lg overflow-hidden relative flex flex-col justify-between gap-2 p-3 hover:bg-white/5"
        >
          <div
            class="text-maximumYellow text-13px uppercase tracking-wide whitespace-nowrap"
          >
            Study {study.letters}
          </div>
          <h3
            id="latest-study-{study.slug}"
            class="font-sans font-400 leading-snug text-15px sm:text-16px line-clamp-4"
          >
            {study.title}
          </h3>
        </a>
      {/each}
    </div>
  </section>
{/if}
