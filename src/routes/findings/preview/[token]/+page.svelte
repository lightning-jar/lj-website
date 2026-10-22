<script lang="ts">
import { page } from "$app/state";

// utils
import { parseMarkdownTextToHtml, stripLeadingH1 } from "$utils/parseMarkdown";

// types
import type { Finding } from "$types/Finding";

interface PreviewFinding {
	slug: string;
	title: string;
	status: string;
	isDraft: boolean;
	publishedAt: string | null;
	frontMatter: Finding;
	markdown: string;
}

let { data } = $props();

let viewState = $state<"loading" | "ready" | "not-found" | "error">("loading");
let finding = $state<PreviewFinding | null>(null);
let html = $state("");

const fm = $derived(finding?.frontMatter ?? ({} as Finding));

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
			if (!res.ok) {
				viewState = "error";
				return;
			}
			const payload = (await res.json()) as { article: PreviewFinding };
			if (stale) return;
			finding = payload.article;
			html = parseMarkdownTextToHtml({
				markdown: stripLeadingH1(payload.article.markdown || ""),
				options: { lazyImages: true, sanitize: true },
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
</script>

<main
  id="main"
  class="page-x-padding main-y-padding pb-6 grid grid-cols-1 gap-6 min-h-screen place-content-start"
>
  <p
    class="max-w-article text-13px tracking-wide uppercase opacity-70 border border-current/30 rounded-sm px-3 py-2 w-fit"
  >
    Draft preview — not published
  </p>

  {#if viewState === "loading"}
    <p class="text-current/70 py-8">Loading the draft…</p>
  {:else if viewState === "not-found"}
    <p class="text-current/70 py-8">
      This preview link is no longer valid. Ask for a fresh link.
    </p>
  {:else if viewState === "error"}
    <p class="text-current/70 py-8">
      The draft could not be loaded. Try refreshing.
    </p>
  {:else if finding}
    <article class="max-w-article">
      <header class="mb-6">
        {#if fm.number}
          <p class="text-12px tracking-wide uppercase opacity-70 mb-2">
            Findings No. {fm.number}
          </p>
        {/if}

        <h1 class="heading-1 mb-3">{fm.title ?? finding.title}</h1>

        {#if fm.description}
          <p class="text-slate-100/80 max-w-prose mb-3">{fm.description}</p>
        {/if}

        <div
          class="flex flex-wrap gap-x-3 gap-y-1 items-baseline text-14px text-slate-100/70"
        >
          {#if fm.project}
            <span>{fm.project}</span>
          {/if}
          {#if fm.area}
            <span>{fm.area}</span>
          {/if}
          {#if fm.verified}
            <span>
              verified <time datetime={fm.verified}>{fm.verified}</time>
            </span>
          {/if}
          {#if fm.environment}
            <span>{fm.environment}</span>
          {/if}
        </div>
      </header>

      <div class="body-article">
        <!-- html is parsed + sanitized locally by parseMarkdown -->
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html html}
      </div>
    </article>
  {/if}
</main>
