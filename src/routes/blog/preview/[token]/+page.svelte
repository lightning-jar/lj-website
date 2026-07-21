<script lang="ts">
import { page } from "$app/state";

// utils
import { parseMarkdownTextToHtml } from "$utils/parseMarkdown";
import { safeLinkUrl } from "$utils/safeLinkUrl";

// types
import type { Article } from "$types/Article";
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

// Attribution: match the draft's author name against the CMS author
// catalog handed over by the server load.
const authorProfile = $derived(
	data.authorCatalog.find(
		(a) => a.name === ((fm.author ?? "") as string).split("|")[0].trim(),
	) ?? null,
);
const authorByline = $derived(
	authorProfile
		? [authorProfile.title, authorProfile.organization]
				.filter(Boolean)
				.join(", ")
		: "",
);

// Reading-list entries are pure metadata (empty markdown body); preview
// them as the card the /reading-list page renders instead of the
// article layout.
let readingListEntry = $derived.by(() => {
	if (!article || article.markdown.trim() !== "") return null;
	const entry = article.frontMatter as unknown as Article;
	if (!entry.summary && !entry.excerpt && !entry.url) return null;
	return entry;
});
let title = $derived(
	typeof fm.title === "string" && fm.title ? fm.title : (article?.title ?? ""),
);
let image = $derived(safeLinkUrl(fm.image));
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
{:else if readingListEntry && article}
  {@const entry = readingListEntry}
  <!-- draft banner -->
  <div
    class="page-x-padding py-3 bg-maximumYellow text-oxford font-700 flex flex-wrap items-baseline gap-x-3"
  >
    <span class="uppercase tracking-wide"
      >{article.isDraft ? "Draft preview" : "Preview"}</span
    >
    <span class="text-14px font-400">
      status: {article.status} · reading-list entry, shown as its card ·
      refresh for updates · not for sharing
    </span>
  </div>

  <!-- reading-list card, mirroring /reading-list -->
  <div class="page-x-padding main-y-padding min-h-screen">
    <article class="max-w-article mb-10">
      {#if safeLinkUrl(entry.image?.src)}
        <img
          src={safeLinkUrl(entry.image?.src)}
          alt={entry.image?.alt ?? ""}
          loading="lazy"
          class="aspect-[5/4] object-cover mb-4 h-160px w-200px rounded overflow-hidden"
        />
      {/if}

      <!-- title  -->
      <h3 class="text-24px font-700 font-serif text-maximumYellow mb-3">
        {entry.title}
      </h3>

      <!-- meta -->
      <div class="flex mb-3 gap-0 text-slate-100/80 gap-2">
        {#if entry.author?.name}
          {#if safeLinkUrl(entry.author?.url)}
            <a href={safeLinkUrl(entry.author?.url)} rel="external"
              >{entry.author.name}</a
            >
          {:else}
            <div>{entry.author.name}</div>
          {/if}
        {/if}

        {#if entry.source?.publicationName}
          {#if safeLinkUrl(entry.source?.publicationUrl)}
            <a href={safeLinkUrl(entry.source?.publicationUrl)} rel="external"
              >{entry.source.publicationName}</a
            >
          {:else}
            <div>{entry.source.publicationName}</div>
          {/if}
        {/if}

        {#if entry.publishDate}
          <span>{entry.publishDate}</span>
        {/if}
      </div>

      <div class="mb-5 w-full">
        {#if entry.summary}
          <h4 class="mb-2 text-accent">Summary:</h4>
          <div class="w-full opacity-90 mb-3">
            {entry.summary}
          </div>
        {/if}

        {#if entry.excerpt}
          <h4 class="mb-2 text-accent">Excerpt:</h4>
          <div class="w-full opacity-90 italic mb-3">
            "{entry.excerpt}"
          </div>
        {/if}

        {#if entry.tags?.[0]}
          <div class="mt-2 flex gap-2 text-0.9em text-accent">
            {#each entry.tags as tag (tag)}
              <span class="opacity-90">#{tag}</span>
            {/each}
          </div>
        {/if}
      </div>

      {#if safeLinkUrl(entry.url)}
        <a
          class="button-accent"
          title="read full story"
          href={safeLinkUrl(entry.url)}
          rel="external"
        >
          Read Full Source
        </a>
      {/if}
    </article>
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
        {#if authorProfile}
          <div
            data-author={authorProfile.name}
            class="flex gap-5 mt-8 bg-slate-100/10 rounded-full max-w-fit pr-8 {authorProfile.imageUrl
              ? ''
              : 'pl-8 py-4'}"
          >
            {#if authorProfile.imageUrl}
              <img
                src={authorProfile.imageUrl}
                loading="lazy"
                alt="headshot of {authorProfile.name}"
                class="!aspect-none !rounded-full !w-20 !h-20 overflow-hidden !mb-0"
              />
            {/if}
            <div class="grid grid-cols-1 place-content-center text-14px">
              <div class="font-serif font-700">{authorProfile.name}</div>
              {#if authorByline}
                <div>{authorByline}</div>
              {/if}
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
                {@const readingUrl = safeLinkUrl(url)}
                {#if readingUrl}
                  <div>
                    <a
                      class="text-maximumYellow opacity-90 font-700 leading-tight mb-1 underline underline-offset-4 hover:opacity-100"
                      href={readingUrl}
                    >
                      {readingTitle}
                    </a>
                  </div>
                {/if}
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
{/if}
