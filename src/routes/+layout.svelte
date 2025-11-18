<script lang="ts">
  // import child page data
  import { page } from "$app/state";

  // import context api
  import { setContext } from "svelte";

  // import css file
  import "uno.css";

  // import components
  import GlobalFooter from "$components/GlobalFooter.svelte";
  import GlobalNav from "$components/GlobalNav.svelte";
  import SvelteAnnounceFix from "$components/SvelteAnnounceFix.svelte";

  // props
  let { children, data } = $props();

  // nav State
  const navState = $state({
    mobileNavOpenState: "closed",
    activeMobileMenu: "Main",
    brandLink: null,
  });
  setContext("navState", { value: navState });
</script>

<svelte:head>
  {#if page.data.meta?.title}
    <title
      >{page.data.meta?.title ?? "Lightning Jar"}
      {data.isHome ? "" : "LJ"}</title
    >
  {/if}
  {#if page.data.meta?.description}
    <meta content={page.data.meta.description} name="description" />
  {/if}
</svelte:head>

<SvelteAnnounceFix />

<GlobalNav nav={data.nav} />

<!-- MediaPlayer -->
<!-- <button popovertarget="mediaPlayer">Open / Close</button> -->
<!-- <div popover="auto" id="mediaPlayer" class=" bg-oxfordDark relative page-x-padding main-y-padding w-full text-white">
		<div class="w-full flex items-start justify-center">
			<MediaPlayer classes="max-w-800px"/>
		</div>
	</div> --


<!-- body -->
<div class="relative w-full max-w-screen overflow-x-hidden place-self-stretch">
  {@render children?.()}
</div>

{#if data.footer}
  <GlobalFooter {...data.footer} />
{/if}
