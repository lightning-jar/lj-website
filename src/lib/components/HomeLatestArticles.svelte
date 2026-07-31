<script lang="ts">
// types
interface ArticleCard {
	slug: string;
	title: string;
	image: string;
}
interface Props {
	articles?: ArticleCard[];
}

// props
let { articles = [] }: Props = $props();
</script>

{#if articles.length}
  <section class="page-x-padding py-12 border-t border-white/10 w-full">
    <div class="flex items-end justify-between gap-4 mb-6">
      <h2 class="heading-2">Latest from our Blog</h2>
      <a
        href="/blog"
        aria-label="View all blog articles"
        class="text-maximumYellow hover:underline text-15px whitespace-nowrap"
        >View all →</a
      >
    </div>

    <div
      class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-5"
    >
      {#each articles as article, index}
        <article class={index === 5 ? "lg:hidden xl:block" : ""}>
          <a
            aria-labelledby="latest-title-{article.slug}"
            href="/blog/{article.slug}"
            class="block aspect-[4/3] w-full border border-current rounded-lg overflow-hidden relative"
          >
            <img
              aria-hidden="true"
              src={article.image}
              alt=""
              class="w-full !h-full object-cover"
              loading="lazy"
            />
            <h3
              id="latest-title-{article.slug}"
              class="px-3 absolute bottom-0 flex backdrop-blur bg-oxfordDark/80 w-full py-2 font-sans font-400 leading-snug text-17px"
            >
              {article.title}
            </h3>
          </a>
        </article>
      {/each}
    </div>
  </section>
{/if}
