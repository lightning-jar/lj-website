<script lang="ts">
import { addIntegration } from "@sentry/sveltekit";

import { safeLinkUrl } from "$utils/safeLinkUrl";

let { data } = $props();

let formattedDate = $derived(
	data.meta?.date ? new Date(data?.meta.date).toLocaleDateString() : "",
);

let image = $derived(safeLinkUrl(data.image));

import type { ArticleSource } from "$types/ArticleSource";

function getAttributionFromSource(source: ArticleSource): string {
	const array: string[] = [];
	if (source?.publication) {
		array.push(source.publication);
	}
	if (source?.author) {
		array.push(source.author);
	}
	if (source?.date) {
		const formattedDate = new Date(source.date)?.toLocaleDateString() || "";
		if (formattedDate) array.push(formattedDate);
	}
	return array.join(", ");
}
</script>

<!-- skip link  -->
<a class="sr-only" href="#main">Skip to main content</a>

<!-- body content area -->
<div
  class="page-x-padding min-h-screen pt-8 pb-8 grid grid-cols-1 gap-8 lg:gap-12 lg:grid-cols-[minmax(65ch,_640px)_1fr]"
>
  <header class="lg:col-span-2">
    <a
      class="hidden sm:flex justify-end mb-0 sm:text-12px text-maximumYellow opacity-80 underline underline-offset-4 mb-6"
      href="/blog"
      title="browse all blog stories">Back to Blog</a
    >
    <h1 class="display text-balance max-w-1000px">{data.title}</h1>
    <div class="mb-5 max-w-prose">{formattedDate}</div>
  </header>

  <main id="main" class="blog-article max-w-prose contents">
    <div class="w-full">
      <!-- article image (wrapped so it is not an adjacent sibling of the
           first body paragraph, which would trigger the [&_img+p] caption rule) -->
      {#if image}
        <div class="mb-8">
          <img src={image} alt={data.imageDescription || data.title} class="w-full h-auto" />
        </div>
      {/if}

      <!-- article body -->
      {@html data.html}

      <!-- attribution -->
      {#if data.meta.author === "Kevin Peckham"}
        <div
          data-author={data.meta.author}
          class="flex gap-5 mt-8 bg-slate-100/10 rounded-full max-w-fit pr-8"
        >
          <img
            src="https://lj-01.nyc3.cdn.digitaloceanspaces.com/images/kevin-peckham-sm.webp"
            loading="lazy"
            alt="cartoonized headshot of Kevin Peckham"
            class="!aspect-none !rounded-full !w-20 !h-20 overflow-hidden !mb-0"
          />
          <div class="grid grid-cols-1 place-content-center text-14px">
            <div class="font-serif font-700">{data.meta.author}</div>
            <div>Principal, Lightning Jar</div>
          </div>
        </div>
      {/if}
    </div>
  </main>

  <aside class="flex justify-end">
    <div class="max-w-480px grid grid-cols-1 gap-6 place-content-start">
      <!-- Quote  -->
      {#if data.quote?.text}
        <div
          class="w-full border border-slate-100/10 bg-slate-100/5 rounded px-3 pt-4 pb-5"
        >
          <blockquote
            class="font-serif font-700 leading-relaxed text-maximumYellow text-20px"
          >
            "{data.quote.text}"
          </blockquote>
          {#if data.quote?.attribution}
            <div class="text-14px font-400 mt-2 opacity-80 mt-3">
              - {data.quote.attribution}
            </div>
          {/if}
        </div>
      {/if}

      <!-- glossary -->
      {#if data.glossary?.[0]}
        <div>
          <h2 class="font-serif font-700 text-17px mb-3 px-3">Glossary</h2>
          <div
            class="w-full border border-slate-100/10 bg-slate-100/5 rounded px-3 pt-4 pb-5"
          >
            <dl class="list-disc list-inside">
              {#each data.glossary as { term, definition }}
                <dt
                  class="text-maximumYellow opacity-90 font-700 leading-tight mb-1"
                >
                  {term}
                </dt>
                <dd class="mb-4 opacity-90 text-0.95em">{definition}</dd>
              {/each}
            </dl>
          </div>
        </div>
      {/if}

      <!-- additional reading -->
      {#if data.additionalReading?.[0]?.title}
        <div>
          <h2 class="font-serif font-700 text-17px mb-3 px-3">
            Additional Reading
          </h2>
          <div
            class="w-full border border-slate-100/10 bg-slate-100/5 rounded px-3 pt-4 pb-5 grid grid-cols-1 gap-3"
          >
            {#each data.additionalReading as { title, url } (url)}
              {@const readingUrl = safeLinkUrl(url)}
              {#if readingUrl}
                <div>
                  <a
                    class="text-maximumYellow opacity-90 font-700 leading-tight mb-1 underline underline-offset-4 hover:opacity-100"
                    href={readingUrl}
                  >
                    {title}
                  </a>
                </div>
              {/if}
            {/each}
          </div>
        </div>
      {/if}

      <!-- sources -->
      {#if data.sources?.[0]?.title}
        <div>
          <h2 class="font-serif font-700 text-17px mb-3 px-3">Sources</h2>
          <div
            class="w-full border border-slate-100/10 bg-slate-100/5 rounded px-3 pt-4 pb-5 grid grid-cols-1 gap-3"
          >
            {#each data.sources as source (source.url)}
              {@const sourceUrl = safeLinkUrl(source.url)}
              {#if source.title && sourceUrl}
                {@const attribution = getAttributionFromSource(source)}
                <div>
                  <a
                    class="block text-maximumYellow opacity-90 font-700 leading-tight mb-2 underline underline-offset-4 hover:opacity-100"
                    href={sourceUrl}
                  >
                    {source.title}
                  </a>
                  <div class="opacity-90 text-0.9em">{attribution}</div>
                </div>
              {/if}
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </aside>
</div>

<!-- prefooter -->
<nav class="page-x-padding py-6">
  {#if data.nextArticleSlug}
    <a
      href="/blog/{data.nextArticleSlug}"
      class="px-3 py-2 rounded border border-current inline-flex max-w-fit leading-none text-maximumYellow opacity-90 font-700 mb-1 hover:(opacity-100 bg-maximumYellow/5)"
    >
      Next Article →
    </a>
  {/if}
</nav>
