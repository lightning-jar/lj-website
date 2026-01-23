<script lang="ts">
import { createAttachmentKey } from "svelte/attachments";

// import child page data
import { page } from "$app/state";

// import css file
import "uno.css";

// import components
import GlobalFooter from "$components/GlobalFooter.svelte";
import GlobalNav from "$components/GlobalNav.svelte";
import SvelteAnnounceFix from "$components/SvelteAnnounceFix.svelte";
import BackToTop from "$components/BackToTop.svelte";

// types
import type { PageMeta } from "$types/PageMeta";

// props
let { children, data } = $props();

// derive page metadata from $page
let pageMeta = $derived((page.data?.meta as PageMeta) ?? {});
</script>

<svelte:head>
  <!-- version -->
  <meta name="version" content={data.version} />

  <!-- title -->
  {#if pageMeta?.title}
    <title>{data.isHome ? pageMeta.title : `${pageMeta.title} - LJ`}</title>
  {/if}

  <!-- description -->
  {#if pageMeta?.description}
    <meta content={pageMeta.description} name="description" />
  {/if}

  <!-- canonical -->
  {#if data.isProduction && data.productionUrl && data?.pathname}
    <link href="https://{data.productionUrl}{data.pathname}" rel="canonical" />
  {/if}

  <!-- robots -->
  {#if data.isProduction && pageMeta?.robotsFollow !== false}
    <meta
      content="index, follow max-image-preview:large, max-snippet:-1, max-video-preview:-1 "
      name="robots"
    />
  {:else}
    <meta
      content="noindex, nofollow, noarchive, nosnippet, notranslate, noimageindex"
      name="robots"
    />
  {/if}

  <!-- open graph image-->
  <!-- {#if pageMeta?.ogImage?.url}
		{@const og = pageMeta.ogImage}
		<meta
			content="en_US"
			property="og:locale" />
		<meta
			content="article"
			property="og:type" />
		<meta
			content={pageMeta?.shortTitle}
			property="og:title" />
		<meta
			content="https://www.securelogix.com/{data.pathname}"
			property="og:url" />
		<meta
			content="SecureLogix"
			property="og:site_name" />
		<meta
			content={data.version}
			property="article:modified_time" />
		<meta
			content={og.url}
			property="og:image" />
		{#if og.width}
			<meta
				content={og.width.toString()}
				property="og:image:width" />
		{/if}
		{#if og.height}
			<meta
				content={og.height.toString()}
				property="og:image:height" />
		{/if}
		{#if og.mimeType}
			<meta
				content={og.mimeType}
				property="og:image:type" />
		{/if}
	{/if} -->
</svelte:head>

<SvelteAnnounceFix />

<GlobalNav />

<!-- children -->
<div class="relative w-full max-w-screen overflow-x-hidden place-self-stretch">
  {@render children?.()}
</div>

{#if data.footer}
  <GlobalFooter {...data.footer} />
{/if}

<BackToTop />
