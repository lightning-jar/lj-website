<script lang="ts">
// import child page data
import { page } from "$app/state";

// import css file
import "uno.css";

// import components
import GlobalFooter from "$components/GlobalFooter.svelte";
import GlobalNav from "$components/GlobalNav.svelte";
import SvelteAnnounceFix from "$components/SvelteAnnounceFix.svelte";

// props
let { children, data } = $props();
</script>

<svelte:head>
  {#if page.data.meta?.title}
    <title
      >{page.data.meta?.title ?? "Lightning Jar"}
      {data.isHome ? "" : "- LJ"}</title
    >
  {/if}
  {#if page.data.meta?.description}
    <meta content={page.data.meta.description} name="description" />
  {/if}
</svelte:head>

<SvelteAnnounceFix />

<GlobalNav />

<!-- body -->
<div class="relative w-full max-w-screen overflow-x-hidden place-self-stretch">
  {@render children?.()}
</div>

{#if data.footer}
  <GlobalFooter {...data.footer} />
{/if}
