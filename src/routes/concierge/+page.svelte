<script lang="ts">
import ConciergeChat from "./ConciergeChat.svelte";
</script>

<main
  id="main"
  class="page-x-padding main-y-padding grid grid-cols-1 gap-8 min-h-screen place-content-start"
>
  <header class="max-w-article">
    <h1 class="display">Concierge</h1>
    <p class="opacity-90 max-w-prose">
      A guide to everything on this site: the client work, the research, the
      packages, and the writing. It answers only from what's published here,
      and shows its sources.
    </p>
  </header>

  <ConciergeChat />
</main>
