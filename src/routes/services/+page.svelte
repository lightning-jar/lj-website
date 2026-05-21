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
let panelsCount: number = $derived(data?.services?.length ?? 0);
</script>

<div class="page-x-padding min-h-screen">
  <div class="main-y-padding pb-6">
    <h1 class="display">{data.banner.heading}</h1>
    <p class="max-w-prose"></p>
  </div>

  <div class="grid grid-cols-1 gap-12 relative max-w-560px">
    {#each data.services as service, index}
      {#if index === activePanel}
        <article class="pb-0">
          <h2 class="uppercase text-slate-100 mb-3 font-700 tracking-wider">
            {service.heading}
          </h2>
          <p
            class="text-32px md:text-36px mb-5 font-700 font-serif text-accent leading-tight max-w-540px"
          >
            "{service.text}"
          </p>
        </article>
      {/if}
    {/each}

    <div
      class="lg:absolute top-100px left-110% lg:right-4 group flex justify-left w-9 h-9"
    >
      <LightningButton
        character="→"
        classes="
          border
          border-maximumYellow
          bg-maximumYellow
          p-10px
          text-oxford
          hover:text-oxford
          hover:bg-transparent
          hover:!text-maximumYellow"
        onclick={() => {
          clickLightningButton();
          incrementPanel();
        }}
      />
    </div>
  </div>
</div>
