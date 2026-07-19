<script lang="ts">
import { page } from "$app/state";

// utils
import { parseMarkdownTextToHtml } from "$utils/parseMarkdown";

// types
import type { ArticleSource } from "$types/ArticleSource";
import type { FrontMatter } from "$types/FrontMatter";

interface PreviewArticle {
	slug: string;
	title: string;
	author: string | null;
	articleDate: string | null;
	status: string;
	isDraft: boolean;
	publishedAt: string | null;
	imageUrl: string | null;
	frontMatter: FrontMatter;
	markdown: string;
}

let { data } = $props();

let viewState = $state<"loading" | "ready" | "not-found" | "error">("loading");
let article = $state<PreviewArticle | null>(null);
let html = $state("");

// The token is the access control; the CMS preview endpoint is keyless
// and CORS-open, so the draft is fetched directly from the reviewer's
// browser — every refresh shows the latest saved version, no rebuild.
// An $effect (not onMount) so client-side navigation between preview
// tokens refetches; async-fetch-into-state is the intended pattern here.
$effect(() => {
	const token = page.params.token;
	const base = data.cmsBaseUrl?.replace(/\/$/, "");
	if (!token || !base) {
		viewState = "error";
		return;
	}
	let stale = false;
	viewState = "loading";
	fetch(`${base}/api/public/blog/preview/${encodeURIComponent(token)}`)
		.then(async (res) => {
			if (stale) return;
			if (res.status === 404) {
				viewState = "not-found";
				return;
			}
			if (!res.ok) throw new Error(`Preview fetch failed: ${res.status}`);
			const body = (await res.json()) as { article: PreviewArticle };
			if (stale) return;
			article = body.article;
			html = parseMarkdownTextToHtml({
				markdown: body.article.markdown,
				options: { sanitize: true, lazyImages: true },
			});
			viewState = "ready";
		})
		.catch(() => {
			if (!stale) viewState = "error";
		});
	return () => {
		stale = true;
	};
});

let fm = $derived(article?.frontMatter ?? {});
let title = $derived(
	typeof fm.title === "string" && fm.title ? fm.title : (article?.title ?? ""),
);
let image = $derived(typeof fm.image === "string" ? fm.image : "");
let formattedDate = $derived(
	typeof fm.date === "string" && fm.date
		? new Date(fm.date).toLocaleDateString()
		: "",
);

function getAttributionFromSource(source: ArticleSource): string {
	const array: string[] = [];
	if (source?.publication) {
		array.push(source.publication);
	}
	if (source?.author) {
		array.push(source.author);
	}
	if (source?.date) {
		const sourceDate = new Date(source.date)?.toLocaleDateString() || "";
		if (sourceDate) array.push(sourceDate);
	}
	return array.join(", ");
}
</script>

<!-- skip link  -->
<a class="sr-only" href="#main">Skip to main content</a>

{#if viewState === "loading"}
  <div class="page-x-padding min-h-screen pt-16">
    <p class="opacity-80">Loading draft preview…</p>
  </div>
{:else if viewState === "not-found"}
  <div class="page-x-padding min-h-screen pt-16">
    <h1 class="display">Preview not found</h1>
    <p class="max-w-prose mt-4 opacity-90">
      This preview link is invalid or its article has been removed. Ask for a
      fresh link from the article's editor.
    </p>
  </div>
{:else if viewState === "error"}
  <div class="page-x-padding min-h-screen pt-16">
    <h1 class="display">Preview unavailable</h1>
    <p class="max-w-prose mt-4 opacity-90">
      The draft could not be loaded. Refresh to try again.
    </p>
  </div>
{:else if article}
  <!-- draft banner -->
  <div
    class="page-x-padding py-3 bg-maximumYellow text-oxford font-700 flex flex-wrap items-baseline gap-x-3"
  >
    <span class="uppercase tracking-wide"
      >{article.isDraft ? "Draft preview" : "Preview"}</span
    >
    <span class="text-14px font-400">
      status: {article.status} · latest saved version · refresh for updates ·
      not for sharing
    </span>
  </div>

  <!-- body content area -->
  <div
    class="page-x-padding min-h-screen pt-8 pb-8 grid grid-cols-1 gap-8 lg:gap-12 lg:grid-cols-[minmax(65ch,_640px)_1fr]"
  >
    <header class="lg:col-span-2">
      <h1 class="display text-balance max-w-1000px">{title}</h1>
      <div class="mb-5 max-w-prose">{formattedDate}</div>
    </header>

    <main id="main" class="blog-article max-w-prose contents">
      <div class="w-full">
        <!-- article image (wrapped so it is not an adjacent sibling of the
             first body paragraph, which would trigger the [&_img+p] caption rule) -->
        {#if image}
          <div class="mb-8">
            <img src={image} alt={title} class="w-full h-auto" />
          </div>
        {/if}

        <!-- article body -->
        {@html html}

        <!-- attribution -->
        {#if fm.author === "Kevin Peckham"}
          <div
            data-author={fm.author}
            class="flex gap-5 mt-8 bg-slate-100/10 rounded-full max-w-fit pr-8"
          >
            <img
              src="https://lj-01.nyc3.cdn.digitaloceanspaces.com/images/kevin-peckham-sm.webp"
              loading="lazy"
              alt="cartoonized headshot of Kevin Peckham"
              class="!aspect-none !rounded-full !w-20 !h-20 overflow-hidden !mb-0"
            />
            <div class="grid grid-cols-1 place-content-center text-14px">
              <div class="font-serif font-700">{fm.author}</div>
              <div>Principal, Lightning Jar</div>
            </div>
          </div>
        {/if}
      </div>
    </main>

    <aside class="flex justify-end">
      <div class="max-w-480px grid grid-cols-1 gap-6 place-content-start">
        <!-- Quote  -->
        {#if fm.quote?.text}
          <div
            class="w-full border border-slate-100/10 bg-slate-100/5 rounded px-3 pt-4 pb-5"
          >
            <blockquote
              class="font-serif font-700 leading-relaxed text-maximumYellow text-20px"
            >
              "{fm.quote.text}"
            </blockquote>
            {#if fm.quote?.attribution}
              <div class="text-14px font-400 mt-2 opacity-80 mt-3">
                - {fm.quote.attribution}
              </div>
            {/if}
          </div>
        {/if}

        <!-- glossary -->
        {#if fm.glossary?.[0]}
          <div>
            <h2 class="font-serif font-700 text-17px mb-3 px-3">Glossary</h2>
            <div
              class="w-full border border-slate-100/10 bg-slate-100/5 rounded px-3 pt-4 pb-5"
            >
              <dl class="list-disc list-inside">
                {#each fm.glossary as { term, definition } (term)}
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
        {#if fm.additionalReading?.[0]?.title}
          <div>
            <h2 class="font-serif font-700 text-17px mb-3 px-3">
              Additional Reading
            </h2>
            <div
              class="w-full border border-slate-100/10 bg-slate-100/5 rounded px-3 pt-4 pb-5 grid grid-cols-1 gap-3"
            >
              {#each fm.additionalReading as { title: readingTitle, url } (url)}
                <div>
                  <a
                    class="text-maximumYellow opacity-90 font-700 leading-tight mb-1 underline underline-offset-4 hover:opacity-100"
                    href={url}
                  >
                    {readingTitle}
                  </a>
                </div>
              {/each}
            </div>
          </div>
        {/if}

        <!-- sources -->
        {#if fm.sources?.[0]?.title}
          <div>
            <h2 class="font-serif font-700 text-17px mb-3 px-3">Sources</h2>
            <div
              class="w-full border border-slate-100/10 bg-slate-100/5 rounded px-3 pt-4 pb-5 grid grid-cols-1 gap-3"
            >
              {#each fm.sources as source (source.url)}
                {#if source.title && source.url}
                  {@const attribution = getAttributionFromSource(source)}
                  <div>
                    <a
                      class="block text-maximumYellow opacity-90 font-700 leading-tight mb-2 underline underline-offset-4 hover:opacity-100"
                      href={source.url}
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
{/if}
