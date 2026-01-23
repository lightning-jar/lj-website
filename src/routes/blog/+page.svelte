<script lang="ts">
let { data } = $props();
</script>

<div
  class="page-x-padding min-h-screen pt-8 pb-8 grid gird-cols-1 min-h-screen place-content-start"
>
  <header class="max-w-prose mb-8">
    <h1 class="display">{data?.meta?.title || "Blog"}</h1>
    <p>
      {data?.meta?.description || ""}
    </p>
    <h2 class="sr-only">Articles</h2>
  </header>

  <main
    class="grid max-w-420px sm-max-w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5"
  >
    {#each data.articles as article}
      <a
        aria-labelledby="title-{article.slug}"
        href="blog/{article.slug}"
        class="aspect-[4/3] w-full border border-current rounded-lg overflow-hidden relative"
      >
        <img
          aria-hidden="true"
          src={article.image}
          alt=""
          class="w-full !h-full object-cover"
          loading="lazy"
        />
        <h3
          id="title-{article.slug}"
          class="px-3 absolute bottom-0 flex backdrop-blur bg-oxfordDark/80 w-full py-2 font-serif font-700 text-17px"
        >
          {article.title}
        </h3>
      </a>
    {/each}
  </main>
</div>
