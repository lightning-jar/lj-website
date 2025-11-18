<script lang="ts">
let { data } = $props();
</script>

<div
  class="page-x-padding main-y-padding pb-6 grid grid-cols-1 gap-8 min-h-screen place-content-start"
>
  {#if data?.banner}
    <section class="max-w-prose">
      <div class="uppercase">
        {data.banner?.tag?.["data-text"]}
      </div>
      <h1 class="display">
        {data.banner?.heading}
      </h1>
      <p class="max-w-prose mb-5 empty:hidden">
        {data.banner?.subheading ?? ""}
      </p>
    </section>
  {/if}

  <!-- main content -->
  <div
    class="gap-x-8 gap-y-12 grid grid-cols-1 md:grid-cols-2 xl:gap-x-24 xl:flex border-t pt-12"
  >
    <!-- col 1 -->
    <div class="lg:max-w-article">
      {#each data.content ?? [] as item}
        <section class="max-w-article">
          <h2 class="text-24px font-700 font-serif text-maximumYellow mb-3">
            {item.heading}
          </h2>

          {#each item.text ?? [] as text}
            <p class="mb-5">{text}</p>
          {/each}
        </section>
      {/each}
    </div>

    <!-- col 2 -->
    <div class="grid grid-cols-1 gap-y-5 place-content-start">
      <!-- testimonials -->
      {#each data.testimonials ?? [] as item}
        <section class="max-w-420px">
          <p
            class="text-22px font-500 font-serif text-maximumYellow mb-3 italic"
          >
            "{item.quote}
          </p>

          {#if item?.attribution}
            <p class="mb-5">
              - {item.attribution.name}, {item.attribution.title}
            </p>
          {/if}
        </section>
      {/each}

      <!-- images -->
      {#each data.images ?? [] as item}
        <section class="max-w-420px">
          <img class="bg-slate-500/40 rounded w-full h-auto" {...item} />
        </section>
      {/each}

      <!-- perspectives -->
      {#each data.perspectives ?? [] as item}
        <section class="max-w-420px bg-slate-500/40 rounded px-4 pt-4 pb-5">
          <p class="text-16px font-600 mb-3 italic">
            "{item.quote}
          </p>

          {#if item?.attribution}
            <div>
              - {item.attribution.name}, {item.attribution.title}, {item
                .attribution.organization}
            </div>
          {/if}
        </section>
      {/each}
    </div>
  </div>
</div>
