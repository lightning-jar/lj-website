<script lang="ts">
  // components
  import LightningButton from "$components/LightningButton.svelte";

  // props
  let { data } = $props();

  // helpers
  function clickLightningButton() {
    const lightningButton = document.querySelector(
      "[data-lightning-button]",
    ) as HTMLButtonElement;
    lightningButton?.click();
  }

  function incrementPanel() {
    activePanel = (activePanel + 1) % panelsCount;
  }

  let activePanel = $state(0);
  let panelsCount: number = $derived(data.testimonials?.length ?? 0);
</script>

<div class="page-x-padding min-h-screen">
  <div class="main-y-padding pb-6">
    <h1 class="display">{data.banner.heading}</h1>
    <p class="max-w-prose empty:hidden">{data.banner.subheading}</p>
  </div>

  <div class="grid grid-cols-1 gap-12 relative max-w-560px">
    {#each data.testimonials as testimonial, index}
      {#if index === activePanel}
        <article class="pb-0">
          <div class="uppercase text-slate-100 mb-3 font-600">
            {testimonial.category}
          </div>
          <h2
            class="text-40px md:text-48px mb-5 font-700 font-serif text-accent leading-tight max-w-540px"
          >
            "{testimonial.quote}"
          </h2>
          <div class="opacity-80 text-slate-100 pr-16">
            <span>{testimonial.attribution.name}</span>
            <span>, {testimonial.attribution.title}</span>
            <span>- {testimonial.attribution.company}</span>
          </div>
        </article>
      {/if}
    {/each}

    <div class=" absolute bottom-0 right-0 lg:right-4 group flex justify-left">
      <LightningButton
        onclick={() => {
          clickLightningButton();
          incrementPanel();
        }}
        classes="flex scale-[0.85]"
      />
    </div>
  </div>
</div>
