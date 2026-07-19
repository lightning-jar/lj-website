<script lang="ts">
// components
import LinkButton from "$components/LinkButton.svelte";
import LinkText from "$components/LinkText.svelte";

// props
let { data } = $props();
</script>

<!-- skip link  -->
<a class="sr-only" href="#main">Skip to main content</a>

<div
  class="page-x-padding article-columns pt-8 sm:pt-2 pb-6 grid grid-cols-1 place-content-start"
>
  {#if data?.banner}
    <header class="pt-2 sm:pt-8 max-w-prose">
      <LinkText
        classes="uppercase lg:text-14px opacity-80 mb-3 leading-tight"
        link={{
          href: "/customer-stories",
          title: "browse all customer stories",
        }}
      >
        Customer Stories
      </LinkText>
      <h1 class="display">
        {data.banner?.heading}
        {#if data.banner?.subtitle}
          <span
            class="block font-sans text-18px lg:text-22px font-500 mt-2 leading-snug opacity-90"
          >
            {data.banner.subtitle}
          </span>
        {/if}
      </h1>
      <p class="mb-5 empty:hidden opacity-90">
        {data.banner?.subheading ?? ""}
      </p>
      <div class="text-maximumYellow opacity-95">
        {#each data.tags ?? [] as tag}
          <span>#{tag}&nbsp;</span>
        {/each}
      </div>
    </header>
    <div class="hidden md:block">&nbsp;</div>
  {/if}

  {#if data.notice}
    <aside
      class="md:col-span-2 max-w-prose border border-maximumYellow/50 bg-maximumYellow/5 rounded p-4 sm:p-5 mb-2"
    >
      {#if data.notice.label}
        <p
          class="text-13px uppercase tracking-wide font-700 text-maximumYellow mb-1"
        >
          {data.notice.label}
        </p>
      {/if}
      <p class="max-w-prose">
        {data.notice.text}
        <a
          href={data.notice.link.href}
          class="text-maximumYellow underline decoration-maximumYellow/40 hover:decoration-maximumYellow underline-offset-4"
        >
          {data.notice.link.text}
        </a>
      </p>
    </aside>
  {/if}

  <hr class="md:col-span-2 opacity-40" />

  <!-- col 1 -->
  <main id="main" class="lg:max-w-article blog-article">
    <!-- CMS markdown body, parsed locally with sanitize enabled -->
    {@html data.html ?? ""}
  </main>

  <!-- col 2 -->
  <aside class="flex justify-end">
    <div class="grid grid-cols-1 gap-y-5 place-content-start md:max-w-420px">
      <h2 class="sr-only">Sidebar</h2>
      <!-- testimonials -->
      <section>
        <h3 class="sr-only">Testimonials</h3>
        {#each data.testimonials ?? [] as item}
          <div>
            <p
              class="text-22px font-500 font-serif text-maximumYellow mb-3 italic"
            >
              "{item.quote}
            </p>

            {#if item?.attribution}
              <p class="mb-5 text-15px opacity-90">
                - {item.attribution.name}, {item.attribution.title}
              </p>
            {/if}
          </div>
        {/each}
      </section>

      <!-- images -->
      <section>
        <h3 class="sr-only">Images</h3>
        {#each data.images ?? [] as item}
          <div>
            <img class="bg-slate-500/40 rounded w-full h-auto" {...item} />
          </div>
        {/each}
      </section>

      <!-- perspectives -->
      <section>
        <h3 class="sr-only">Perspectives</h3>
        {#each data.perspectives ?? [] as item}
          <div class="bg-slate-500/10 rounded px-4 pt-4 pb-5 mb-8">
            <p class="text-16px font-600 mb-3 italic opacity-90">
              "{item.quote}
            </p>

            {#if item?.attribution}
              <div class="text-15px opacity-90">
                - {item.attribution.name}, {item.attribution.title}, {item
                  .attribution.organization}
              </div>
            {/if}
          </div>
        {/each}
      </section>

      <!-- featured technologies -->
      {#if data.technologies?.[0]}
        <section class="w-full">
          <h3 class="mb-3 text-maximumYellow">Featured Technologies</h3>
          <div
            class="px-4 pt-5 pb-6 w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 place-items-center place-content-center overflow-hidden gap-4 border rounded border-slate-100/40"
          >
            {#each data.technologies ?? [] as item}
              {#if item?.logo?.src && item?.link?.href}
                <a
                  aria-label={item.name}
                  href={item.link.href}
                  class="w-full overflow-hidden aspect-4/3 flex justify-center items-center rounded bg-slate-100/5 hover:bg-slate-100/10 hover:outline-2 !outline-maximumYellow focus-visible:outline-2 focus-visible:bg-slate-100/10"
                >
                  <img
                    class="w-full h-auto rounded"
                    {...item.logo}
                    title={item.name}
                  />
                </a>
              {/if}
            {/each}
          </div>
        </section>
      {/if}
    </div>
  </aside>
</div>

<!-- prefooter  -->
<nav class="block page-x-padding pt-4 mb-10">
  <!-- <a
    class="px-3 py-2 rounded border inline-flex justify-center items-center leading-none text-15px opacity-80"
    href="/customer-stories"
    title="browse all customer stories"
  >
    All Customer Stories
  </a> -->
  {#if data.nextStorySlug}
    <LinkButton
      classes="mb-4"
      link={{
        href: `/customer-stories/${data.nextStorySlug}`,
        title: "browse all customer stories",
      }}
    >
      Next Story
    </LinkButton>
  {/if}
  <LinkText
    link={{
      href: "/customer-stories",
      title: "browse all customer stories",
    }}
  >
    Back to all Customer Stories
  </LinkText>
</nav>
