<script lang="ts">
import FeedBadge from "$components/FeedBadge.svelte";

let { data } = $props();
</script>

<main id="main">
<header class="page-x-padding main-y-padding !pb-8">
  <h1 class="heading-1 max-w-article">Feeds</h1>
  <p class="max-w-article">
    Everything Lightning Jar publishes is available by Atom feed — follow
    in any feed reader, no algorithm in between. Subscribe to a single
    stream, or take everything at once.
  </p>
</header>

<div class="page-x-padding pb-24">
  <div class="grid grid-cols-1 gap-5 max-w-article">
    {#each data.feeds as feed}
      <section
        class="border border-slate-100/15 rounded px-4 pt-4 pb-5 flex items-start justify-between gap-4"
      >
        <div class="max-w-prose">
          <h2 class="text-19px font-serif text-maximumYellow font-700 mb-1">
            {feed.title}
          </h2>
          <p class="opacity-90 text-15px leading-snug mb-2">
            {feed.description}
          </p>
          <code class="text-13px opacity-70">https://www.lightningjar.com{feed.href}</code>
        </div>
        <FeedBadge href={feed.href} />
      </section>
    {/each}
  </div>
</div>
</main>
