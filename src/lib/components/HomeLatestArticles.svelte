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
        class="view-all-link"
        >View All<span>→</span></a
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
            title={article.title}
            class="w-full"
          >
            <div class="flex aspect-4/3 w-full rounded-t-lg overflow-hidden relative">
	            <img
	              aria-hidden="true"
	              src={article.image}
	              alt=""
	              class="w-full !h-full object-cover"
	              loading="lazy"
	            >
            </div>
            <h3
              id="latest-title-{article.slug}"
              class="px-3 pt-2 pb-4 bg-white/5 rounded-b-lg min-h-68px"
            >
              <div class="tile-text line-clamp-2">{article.title}</div>
            </h3>
          </a>
        </article>
      {/each}
    </div>
  </section>
{/if}
