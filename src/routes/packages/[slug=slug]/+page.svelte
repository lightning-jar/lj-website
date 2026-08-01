<script lang="ts">
import LinkText from "$components/LinkText.svelte";

let { data } = $props();
let pkg = $derived(data.pkg);
</script>

<main
  id="main"
  class="page-x-padding pt-8 pb-24 grid grid-cols-1 gap-8 lg:gap-12 lg:grid-cols-[minmax(0,_640px)_1fr]"
>
  <div>
    <header class="pt-2 sm:pt-8">
      <LinkText
        classes="uppercase lg:text-14px opacity-80 mb-3 leading-tight"
        link={{
          href: "/packages",
          title: "browse all packages and tools",
        }}
      >
        Packages &amp; Tools
      </LinkText>
      <h1 class="heading-1">{pkg.name}</h1>
      <div class="opacity-90 italic mb-6">
        {pkg.category} · {pkg.status}{pkg.license ? ` · ${pkg.license}` : ""}
      </div>
    </header>

    <div>
      <!-- description -->
      {#each pkg.description ?? [] as paragraph}
        <p class="opacity-90 mb-4 max-w-prose">{paragraph}</p>
      {/each}

      <!-- install -->
      {#if pkg.install}
        <pre
          class="mb-6 max-w-prose overflow-x-auto rounded border border-slate-100/15 bg-slate-100/5 px-4 py-3 text-14px"><code
            >{pkg.install}</code
          ></pre>
      {/if}

      <!-- links -->
      {#if pkg.links?.length}
        <p class="mb-8 flex flex-wrap gap-3">
          {#each pkg.links as link}
            <a
              href={link.href}
              rel={link.href.startsWith("/") ? undefined : "external"}
              title="{pkg.name}: {link.label}"
              class="button-small"
            >
              {link.label} →
            </a>
          {/each}
        </p>
      {/if}

      <!-- features -->
      {#if pkg.features?.length}
        <section class="mb-8">
          <h2 class="text-22px font-serif text-maximumYellow font-700 mb-3">
            What It Does
          </h2>
          <ul class="grid grid-cols-1 gap-1.5 pl-0 ml-0 opacity-90 max-w-prose">
            {#each pkg.features as feature}
              <li class="leading-snug list-disc list-inside ml-0">{feature}</li>
            {/each}
          </ul>
        </section>
      {/if}

      <!-- related reading -->
      {#if pkg.relatedArticles?.length}
        <section class="mb-8">
          <h2 class="text-22px font-serif text-maximumYellow font-700 mb-3">
            The Story Behind It
          </h2>
          <ul class="grid grid-cols-1 gap-2 pl-0 ml-0 opacity-90 max-w-prose">
            {#each pkg.relatedArticles as article}
              <li class="leading-snug list-disc list-inside ml-0">
                <a
                  href={article.href}
                  class="underline decoration-maximumYellow/40 hover:decoration-maximumYellow underline-offset-4"
                >
                  {article.title}
                </a>
              </li>
            {/each}
          </ul>
        </section>
      {/if}
    </div>
  </div>

  <!-- sidebar -->
  <aside class="flex lg:justify-end">
    <div
      class="lg:max-w-400px w-full grid grid-cols-1 gap-6 place-content-start"
    >
      {#if pkg.techId}
        <div
          class="border border-slate-100/15 rounded px-4 pt-4 pb-5 bg-slate-100/5"
        >
          <h2 class="text-17px font-serif text-maximumYellow font-700 mb-2">
            In Our Stack
          </h2>
          <p class="opacity-90 text-15px leading-snug mb-3">
            We use {pkg.name} in our own production work. See where it sits in
            the stack.
          </p>
          <a
            href="/technologies/{pkg.techId}"
            class="underline decoration-maximumYellow/40 hover:decoration-maximumYellow underline-offset-4 text-15px"
          >
            {pkg.name} in Technologies →
          </a>
        </div>
      {/if}

      {#if data.related.length}
        <nav class="border px-3 pt-4 pb-5 rounded border-slate-100/60 max-h-fit">
          <h2 class="text-17px font-serif text-maximumYellow font-700 mb-3">
            More Packages &amp; Tools
          </h2>
          <ul class="grid grid-cols-1 gap-3 pl-0 ml-0">
            {#each data.related as item}
              <li class="leading-tight">
                <a
                  href="/packages/{item.id}"
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
</main>
