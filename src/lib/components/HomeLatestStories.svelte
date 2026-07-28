<script lang="ts">
// types
interface StoryCard {
	slug: string;
	title: string;
	image: string;
}
interface Props {
	stories?: StoryCard[];
}

// props
let { stories = [] }: Props = $props();
</script>

{#if stories.length}
  <section class="page-x-padding py-12 border-t border-white/10 w-full">
    <div class="flex items-end justify-between gap-4 mb-6">
      <h2 class="heading-2">Latest Customer Stories</h2>
      <a
        href="/customer-stories"
        aria-label="View all customer stories"
        class="text-maximumYellow hover:underline text-15px whitespace-nowrap"
        >View all →</a
      >
    </div>

    <div
      class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-5"
    >
      {#each stories as story, index}
        <a
          aria-labelledby="latest-story-{story.slug}"
          href="/customer-stories/{story.slug}"
          class="{index === 5
            ? 'lg:hidden xl:block'
            : ''} aspect-[4/3] w-full border border-current rounded-lg overflow-hidden relative"
        >
          <img
            aria-hidden="true"
            src={story.image}
            alt=""
            class="w-full !h-full object-cover"
            loading="lazy"
          />
          <h3
            id="latest-story-{story.slug}"
            class="px-3 absolute bottom-0 flex backdrop-blur bg-oxfordDark/80 w-full py-2 font-sans font-400 leading-snug text-17px"
          >
            {story.title}
          </h3>
        </a>
      {/each}
    </div>
  </section>
{/if}
