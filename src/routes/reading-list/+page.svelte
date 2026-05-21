<script lang="ts">
// components
import FeedBadge from "$components/FeedBadge.svelte";
import LinkButton from "$components/LinkButton.svelte";

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
    <h2 class="sr-only">Select a Customer Story Below to Read More</h2>
    {#each data?.articles ?? [] as article, index}
      {#if index !== -1}
        <hr class="mb-6 opacity-40" />
      {/if}
      <article class="max-w-article mb-10">
        {#if article?.image?.src}
          <img
            src={article.image.src}
            alt={article.image.alt}
            loading="lazy"
            class="aspect-[5/4] object-cover mb-4 h-160px w-200px rounded overflow-hidden"
          />
        {/if}

        <!-- title  -->
        <h3 class="text-24px font-700 font-serif text-maximumYellow mb-3">
          {article?.title}
        </h3>

        <!-- meta -->
        <div class="flex mb-3 gap-0 text-slate-100/80 gap-2">
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

        <div class="mb-5 w-full">
          <!-- summary -->
          {#if article?.summary}
            <h4 class="mb-2 text-accent">Summary:</h4>
            <div class="w-full opacity-90 mb-3">
              {article?.summary}
            </div>
          {/if}

          <!-- excerpt -->
          {#if article?.excerpt}
            <h4 class="mb-2 text-accent">Excerpt:</h4>
            <div class="w-full opacity-90 italic mb-3">
              "{article?.excerpt ?? "No excerpt available."}"
            </div>
          {/if}

          {#if article.tags?.[0]}
            <div class="mt-2 flex gap-2 text-0.9em text-accent">
              {#each article.tags as tag}
                <span class="opacity-90 hover-opacity-100 cursor-pointer"
                  >#{tag}</span
                >
              {/each}
            </div>
          {/if}
        </div>

        {#if article.url}
          <!-- <a
            class="button-accent"
            title="read full story"
            href="/customer-stories/{story.slug ?? ''}">Read Story</a
          > -->

          <LinkButton
            classes="button-accent"
            link={{
              href: `${article.url ?? ""}`,
              title: "read full story",
            }}
          >
            Read Full Source
          </LinkButton>
        {/if}
      </article>
    {/each}
  </main>
</div>
