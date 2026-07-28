<script lang="ts">
// components
import LinkText from "$components/LinkText.svelte";

// utils
import { safeLinkUrl } from "$utils/safeLinkUrl";

let { data } = $props();

let article = $derived(data.article);
</script>

<!-- skip link  -->
<main
  id="main"
  class="page-x-padding main-y-padding pb-6 grid grid-cols-1 gap-8 min-h-screen place-content-start"
>
  <header class="max-w-prose">
    <LinkText
      classes="uppercase lg:text-14px opacity-80 mb-3 leading-tight"
      link={{
        href: "/reading-list",
        title: "browse the full reading list",
      }}
    >
      Reading List
    </LinkText>
    <h1 class="display text-balance">{article.title}</h1>

    <!-- meta -->
    <div class="flex mt-3 gap-2 text-slate-100/80">
      {#if article.author?.name}
        {#if safeLinkUrl(article.author?.url)}
          <a href={safeLinkUrl(article.author?.url)} rel="external"
            >{article.author.name}</a
          >
        {:else}
          <div>{article.author.name}</div>
        {/if}
      {/if}

      {#if article.source?.publicationName}
        {#if safeLinkUrl(article.source?.publicationUrl)}
          <a href={safeLinkUrl(article.source?.publicationUrl)} rel="external"
            >{article.source.publicationName}</a
          >
        {:else}
          <div>{article.source.publicationName}</div>
        {/if}
      {/if}

      {#if article.publishDate}
        <span>{article.publishDate}</span>
      {/if}
    </div>
  </header>

  <div class="max-w-article">
    {#if safeLinkUrl(article.image?.src)}
      <img
        src={safeLinkUrl(article.image?.src)}
        alt={article.image?.alt ?? ""}
        loading="lazy"
        class="aspect-[5/4] object-cover mb-6 h-160px w-200px rounded overflow-hidden"
      />
    {/if}

    {#if article.summary}
      <h2 class="mb-2 text-accent">Summary:</h2>
      <div class="w-full opacity-90 mb-5">
        {article.summary}
      </div>
    {/if}

    {#if article.excerpt}
      <h2 class="mb-2 text-accent">Excerpt:</h2>
      <div class="w-full opacity-90 italic mb-5">
        "{article.excerpt}"
      </div>
    {/if}

    {#if article.tags?.[0]}
      <div class="mb-6 flex gap-2 text-0.9em text-accent">
        {#each article.tags as tag (tag)}
          <span class="opacity-90">#{tag}</span>
        {/each}
      </div>
    {/if}

    {#if safeLinkUrl(article.url)}
      <a
        class="button-accent"
        title="read the full source article"
        href={safeLinkUrl(article.url)}
        rel="external"
      >
        Read Full Source
      </a>
    {/if}
  </div>

  <nav class="pt-4">
    <LinkText
      link={{
        href: "/reading-list",
        title: "browse the full reading list",
      }}
    >
      Back to the Reading List
    </LinkText>
  </nav>
</main>
