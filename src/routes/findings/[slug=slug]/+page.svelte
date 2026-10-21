<script lang="ts">
let { data } = $props();

const fm = $derived(data.finding.frontMatter);
</script>

<main
  id="main"
  class="page-x-padding main-y-padding pb-6 grid grid-cols-1 gap-6 min-h-screen place-content-start"
>
  <article class="max-w-article">
    <header class="mb-6">
      {#if fm.number}
        <p class="text-12px tracking-wide uppercase opacity-70 mb-2">
          <a
            class="hover:text-accent hover:underline underline-offset-2"
            href="/findings"
          >
            Findings
          </a>
          No. {fm.number}
        </p>
      {/if}

      <h1 class="heading-1 mb-3">{fm.title}</h1>

      {#if fm.description}
        <p class="text-slate-100/80 max-w-prose mb-3">{fm.description}</p>
      {/if}

      <!-- the receipt line: where and when this was verified -->
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
      {@html data.finding.html}
    </div>

    <footer class="mt-10 pt-4 border-t border-white/10">
      <a
        class="text-maximumYellow opacity-90 hover:opacity-100 underline-offset-4 hover:underline"
        href="/findings"
      >
        All findings
      </a>
    </footer>
  </article>
</main>
