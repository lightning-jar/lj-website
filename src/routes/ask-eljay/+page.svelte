<script lang="ts">
import ConciergeChat from "$components/ConciergeChat.svelte";
</script>

<main
  id="main"
  class="page-x-padding main-y-padding grid grid-cols-1 gap-8 min-h-screen place-content-start"
>
  <header class="max-w-article">
    <div class="flex items-baseline gap-4 flex-wrap"><h1 class="heading-1">Ask Eljay</h1><span class="opacity-90">(our AI assistant)</span></div>
    <p class="opacity-90 max-w-prose">
      A guide to everything on this site: the client work, the research, the
      packages, and the writing. It answers only from what's published here,
      and shows its sources.
    </p>
  </header>

  <div class="max-w-prose min-h-240px">
  	<ConciergeChat />
  </div>
</main>
