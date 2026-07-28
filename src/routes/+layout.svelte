<script lang="ts">
import { createAttachmentKey } from "svelte/attachments";

import { goto } from "$app/navigation";

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

import { initWebMcp } from "$utils/webMcp";

// props
let { children, data } = $props();

// WebMCP: register site tools for in-browser agents (feature-detected,
// no-op in browsers without the experimental API)
$effect(() => {
	initWebMcp((path) => goto(path));
});

// derive page metadata from $page
let pageMeta = $derived((page.data?.meta as PageMeta) ?? {});

// social cards (Open Graph / Twitter)
const SITE = "https://www.lightningjar.com";
const DEFAULT_OG_IMAGE = `${SITE}/og-image.png`;
let ogTitle = $derived(pageMeta?.title || "Lightning Jar");
let ogDescription = $derived(pageMeta?.description ?? "");
let ogUrl = $derived(
	`${SITE}${page.url.pathname === "/" ? "" : page.url.pathname}`,
);
// article heroes ride in via pageMeta.ogImage; anything non-absolute
// falls back to the branded default card
let ogImage = $derived.by(() => {
	const url = pageMeta?.ogImage?.url;
	return url && /^https:\/\//.test(url) ? url : DEFAULT_OG_IMAGE;
});
let ogType = $derived(
	/^\/(blog|customer-stories|reading-list)\/[^/]+$/.test(page.url.pathname)
		? "article"
		: "website",
);
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

  <!-- atom feed autodiscovery -->
  <link
    href="/atom.xml"
    rel="alternate"
    title="Lightning Jar — Blog & Reading List"
    type="application/atom+xml"
  />

  <!-- social cards -->
  <meta property="og:site_name" content="Lightning Jar" />
  <meta property="og:type" content={ogType} />
  <meta property="og:title" content={ogTitle} />
  {#if ogDescription}
    <meta property="og:description" content={ogDescription} />
  {/if}
  <meta property="og:url" content={ogUrl} />
  <meta property="og:image" content={ogImage} />
  {#if ogImage === DEFAULT_OG_IMAGE}
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
  {/if}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={ogTitle} />
  {#if ogDescription}
    <meta name="twitter:description" content={ogDescription} />
  {/if}
  <meta name="twitter:image" content={ogImage} />

  <!-- robots -->
  {#if data.isProduction && pageMeta?.robotsFollow !== false}
    <meta
      content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      name="robots"
    />
  {:else}
    <meta
      content="noindex, nofollow, noarchive, nosnippet, notranslate, noimageindex"
      name="robots"
    />
  {/if}
</svelte:head>

<SvelteAnnounceFix />

<a class="sr-only" href="#main">Skip to main content</a>

<GlobalNav />

<!-- children -->
<div class="relative w-full max-w-screen place-self-stretch">
  {@render children?.()}
</div>

{#if data.footer}
  <GlobalFooter {...data.footer} />
{/if}

<BackToTop />
