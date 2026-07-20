<script lang="ts">
// components
import FeedBadge from "$components/FeedBadge.svelte";

let { data } = $props();
</script>

<svelte:head>
  <link
    href="/reading-list/atom.xml"
    rel="alternate"
    title="Lightning Jar — Reading List"
    type="application/atom+xml"
  />
</svelte:head>

<div
  class="page-x-padding main-y-padding pb-6 grid grid-cols-1 gap-12 min-h-screen place-content-start"
>
  {#if data?.banner}
    <div class="flex items-start justify-between gap-4">
      <header class="max-w-prose">
        <h1 class="display">
          {data.banner?.heading}
        </h1>
        <p class="max-w-prose mb-5 empty:hidden">
          {data.banner?.subheading ?? ""}
        </p>
      </header>
      <FeedBadge href="/reading-list/atom.xml" />
    </div>
  {/if}

  <main>
    <h2 class="sr-only">Select an Entry Below to Read More</h2>
    {#each data?.articles ?? [] as article, index (article.slug)}
      {#if index !== 0}
        <hr class="mb-5 opacity-40" />
      {/if}
      <article
        class="max-w-article mb-5 content-auto-480 scroll-mt-24"
        id={article.slug}
      >
        <!-- title, linking to the entry's detail page -->
        <h3 class="text-20px font-700 font-serif mb-1">
          <a
            class="text-maximumYellow opacity-90 hover:opacity-100 underline-offset-4 hover:underline"
            href="/reading-list/{article.slug}"
          >
            {article?.title}
          </a>
        </h3>

        <!-- meta -->
        <div class="flex text-slate-100/80 gap-2">
          <!-- author -->
          {#if article?.author?.name}
            <!-- linked  -->
            {#if article?.author?.url}
              <a href={article?.author.url} rel="external"
                >{article?.author?.name}</a
              >
            {:else}
              <div>{article?.author?.name}</div>
            {/if}
          {/if}

          <!-- publisher -->
          {#if article?.source.publicationName}
            {#if article?.source.publicationUrl}
              <a href={article?.source.publicationUrl} rel="external"
                >{article?.source.publicationName}</a
              >
            {:else}
              <div>{article?.source.publicationName}</div>
            {/if}
          {/if}
          <!-- date -->
          {#if article?.publishDate}
            <span>{article?.publishDate}</span>
          {/if}
        </div>
      </article>
    {/each}
  </main>
</div>
