<script lang="ts">
import LinkText from "$components/LinkText.svelte";

let { data } = $props();
let tech = $derived(data.technology);
</script>

<!-- skip link -->
<a class="sr-only" href="#main">Skip to main content</a>

<div
  class="page-x-padding pt-8 pb-24 grid grid-cols-1 gap-8 lg:gap-12 lg:grid-cols-[minmax(0,_640px)_1fr]"
>
  <div>
    <header class="pt-2 sm:pt-8">
      <LinkText
        classes="uppercase lg:text-14px opacity-80 mb-3 leading-tight"
        link={{
          href: "/technologies",
          title: "browse all technologies",
        }}
      >
        Technologies
      </LinkText>
      <h1 class="display">{tech.name}</h1>
      <div class="opacity-90 italic mb-6">
        {tech.category}{tech.license ? ` · ${tech.license}` : ""}
      </div>
    </header>

    <main id="main">
      <!-- our-package callout -->
      {#if tech.packagePage}
        <div
          class="mb-6 max-w-prose border border-maximumYellow/40 rounded px-4 py-3 bg-maximumYellow/5"
        >
          <p class="opacity-90 text-15px leading-snug">
            This is a Lightning Jar package.
            <a
              href={tech.packagePage}
              class="underline decoration-maximumYellow/60 hover:decoration-maximumYellow underline-offset-4"
            >
              See the full package page →
            </a>
          </p>
        </div>
      {/if}

      <!-- description -->
      {#each tech.description ?? [] as paragraph}
        <p class="opacity-90 mb-4 max-w-prose">{paragraph}</p>
      {/each}

      <!-- website link -->
      {#if tech.link?.href}
        <p class="mb-8">
          <a
            href={tech.link.href}
            rel="external"
            title="go to {tech.name} website"
            class="button-small"
          >
            Visit {tech.name} →
          </a>
        </p>
      {/if}

      <!-- use cases -->
      {#if tech.useCases?.length}
        <section class="mb-8">
          <h2 class="text-22px font-serif text-maximumYellow font-700 mb-3">
            How We Use It
          </h2>
          <ul class="grid grid-cols-1 gap-1.5 pl-0 ml-0 opacity-90 max-w-prose">
            {#each tech.useCases as useCase}
              <li class="leading-snug list-disc list-inside ml-0">{useCase}</li>
            {/each}
          </ul>
        </section>
      {/if}

      <!-- related article -->
      {#if tech.relatedArticle}
        <p class="opacity-90 mb-8">
          Related reading:
          <a
            href={tech.relatedArticle.href}
            class="underline decoration-maximumYellow/40 hover:decoration-maximumYellow underline-offset-4"
          >
            {tech.relatedArticle.title}
          </a>
        </p>
      {/if}

      <!-- supercategory context -->
      {#if data.supercategory}
        <section class="mb-8 border border-slate-100/15 rounded px-4 pt-4 pb-5 max-w-prose">
          <h2 class="text-17px font-serif text-maximumYellow font-700 mb-2">
            <a
              href="/technologies#{data.supercategory.id}"
              class="underline decoration-maximumYellow/40 hover:decoration-maximumYellow underline-offset-4"
            >
              {data.supercategory.name}
            </a>
          </h2>
          <p class="opacity-90 text-15px leading-snug">
            {data.supercategory.description}
          </p>
        </section>
      {/if}
    </main>
  </div>

  <!-- sidebar -->
  <aside class="flex lg:justify-end">
    <div class="lg:max-w-400px w-full grid grid-cols-1 gap-6 place-content-start">
      {#if tech.logo?.src}
        <div
          class="w-full max-w-260px bg-slate-100/5 border border-slate-100/10 rounded p-6 flex items-center justify-center"
        >
          <img
            src={tech.logo.src}
            alt={tech.logo.alt ?? `${tech.name} logo`}
            class="w-full h-auto max-h-24 object-contain"
            loading="lazy"
          />
        </div>
      {/if}

      {#if data.related.length}
        <nav
          class="border px-3 pt-4 pb-5 rounded border-slate-100/60 max-h-fit"
        >
          <h2 class="text-17px font-serif text-maximumYellow font-700 mb-3">
            More {data.supercategory?.shortName ?? "Related Technologies"}
          </h2>
          <ul class="grid grid-cols-1 gap-3 pl-0 ml-0">
            {#each data.related as item}
              <li class="leading-tight">
                <a
                  href="/technologies/{item.id}"
                  class="opacity-90 underline decoration-current hover:(text-maximumYellow opacity-100) underline-offset-4"
                >
                  {item.name}
                </a>
              </li>
            {/each}
          </ul>
        </nav>
      {/if}
    </div>
  </aside>
</div>
