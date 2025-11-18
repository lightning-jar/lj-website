<script lang="ts">
  // components
  import NavLogoBlock from "$components/NavLogoBlock.svelte";

  // imported types
  import type { HTMLLinkAttributes } from "svelte/elements";

  // local types
  interface Props {
    heading: string;
    text: string[];
    callouts: {
      heading?: string;
      content?: HTMLLinkAttributes[];
      footnotes?: string[];
    }[];
    legalLinks: HTMLLinkAttributes[];
  }

  let {
    heading = "",
    text = [],
    callouts = [],
    legalLinks = [],
  }: Props = $props();
</script>

<footer
  class="page-x-padding main-y-padding text-white font-serif bg-oxfordDark h-screen"
>
  <!-- upper -->
  <div class="mt-16 md:grid grid-cols-2 gap-16">
    <!-- col 1: logo & messaging -->
    <div class="grid grid-cols-1 place-content-start gap-0 max-w-sm">
      <!-- logo -->
      <div class="mb-8">
        <NavLogoBlock />
      </div>

      <!-- heading -->
      <h2 class="text-18px font-semibold mb-4 text-maximumYellow">
        {heading}
      </h2>

      <!-- text -->
      <div class="mb-16 opacity-80">
        {#each text as paragraph}
          <p>{paragraph}</p>
        {/each}
      </div>
    </div>

    <!-- col:2 callouts -->
    <div class="mt-14 grid grid-cols-1 gap-8">
      {#each callouts as callout}
        <!-- contact -->
        <div>
          <!-- callout heading -->
          {#if callout.heading}
            <h3 class="text-xl font-semibold mb-3 text-slate-100 opacity-95">
              {callout.heading}
            </h3>
          {/if}

          <!-- callout content -->
          {#each callout?.content ?? [] as calloutItem, index}
            {#if calloutItem?.href}
              <a
                class="text-maximumYellow opacity-90 hover:opacity-100 transition-all hover:underline underline-offset-4"
                title={calloutItem?.title}
                href={calloutItem.href}>{calloutItem?.["data-text"]}</a
              >
            {:else if calloutItem?.["data-text"]}
              <span class="opacity-90">{calloutItem["data-text"]}</span>
            {/if}
            {#if index !== (callout?.content?.length ?? 0) - 1}
              <span class="opacity-90">・&nbsp;</span>
            {/if}
          {/each}

          <!-- callout footnotes -->
          {#if callout?.footnotes?.[0]}
            <i class="opacity-80 block text-15px mt-4">
              {#each callout.footnotes ?? [] as footnote, index}
                {#if footnote}
                  <span>{"*".repeat(index + 1)}&nbsp;</span><span
                    >{footnote}</span
                  >
                {/if}
              {/each}
            </i>
          {/if}
        </div>
      {/each}
    </div>
  </div>

  <!-- legal links -->
  <div class="mb-4 flex gap-4">
    {#each legalLinks ?? [] as link}
      {#if link.href && link["data-text"]}
        <a
          class="font-sans inline-block text-xs opacity-80 hover:text-maximumYellow underline underline-offset-4 decoration-slate-500"
          href={link.href}
        >
          {link["data-text"]}
        </a>
      {/if}
    {/each}
  </div>

  <!-- copyright text-->
  <div class="font-sans text-xs opacity-80 mb-36">
    &copy; Copyright 2002 - {new Date().getFullYear()} SiiTE Interactive LLC dba
    Lightning Jar.
  </div>
</footer>
