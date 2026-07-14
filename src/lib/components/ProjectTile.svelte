<script lang="ts">
// Project card used by the /research and /fun landing pages; the links
// area differs per page and renders via the children snippet.
import type { Snippet } from "svelte";

interface Props {
	name: string;
	status: string;
	summary: string;
	children: Snippet;
}

// props
let { name, status, summary, children }: Props = $props();
</script>

<article class="border border-white/10 rounded p-6">
  <div class="flex items-baseline gap-3 mb-2">
    <h2 class="font-mono text-20px text-maximumYellow">
      {name}
    </h2>
    <span
      class="text-11px uppercase tracking-wider opacity-70 font-mono"
    >
      {status}
    </span>
  </div>
  <p class="opacity-90 mb-4">{summary}</p>
  {@render children()}
</article>
