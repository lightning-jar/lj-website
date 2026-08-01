<script lang="ts">
// components
import LinkButton from "$components/LinkButton.svelte";

// props
let { data } = $props();
</script>

<main
  id="main"
  class="page-x-padding main-y-padding grid grid-cols-1 gap-12 min-h-screen place-content-start"
>
  <header class="max-w-prose">
    <h1 class="heading-1">
      {data.banner?.heading}
    </h1>
    <p class="max-w-prose empty:hidden">
      {data.banner?.subheading ?? ""}
    </p>
  </header>

  <div class="grid grid-cols-1 gap-10">
    {#each data.sections ?? [] as section}
      <section class="max-w-article">
        <h2 class="heading-2">{section.heading}</h2>
        {#each section.text as paragraph}
          <p class="opacity-90 mb-4">
            {paragraph}
          </p>
        {/each}
      </section>
    {/each}

    {#if data.clients?.length}
      <section class="max-w-article">
        <ul
          class="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1.5 text-14px opacity-85"
        >
          {#each data.clients as client}
            <li>{client}</li>
          {/each}
        </ul>
      </section>
    {/if}

    {#if data.ctas?.primary || data.ctas?.secondary}
      <div class="flex flex-wrap gap-3">
        {#if data.ctas.primary}
          <LinkButton
            classes="button-accent"
            link={{
              href: data.ctas.primary.href,
              title: data.ctas.primary.title ?? data.ctas.primary.label,
            }}
          >
            {data.ctas.primary.label}
          </LinkButton>
        {/if}
        {#if data.ctas.secondary}
          <LinkButton
            classes="text-yellow-50"
            link={{
              href: data.ctas.secondary.href,
              title: data.ctas.secondary.title ?? data.ctas.secondary.label,
            }}
          >
            {data.ctas.secondary.label}
          </LinkButton>
        {/if}
      </div>
    {/if}
  </div>
</main>
