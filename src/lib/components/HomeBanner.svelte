<script lang="ts">
  // svelte context browserApiErrorsIntegration
  import { getContext } from "svelte";
  //
  // components
  import GraphicDots from "./GraphicDots.svelte";

  // props
  let {
    headline = [],
    text = [],
    ticker = [],
  }: {
    headline?: string[];
    text?: string[];
    ticker?: string[];
  } = $props();

  const lightningCount = getContext("lightningCount") as { value: number };

  let headlineIndex = $derived(
    lightningCount.value > -1 ? lightningCount.value : 0,
  );
  $effect(() => {
    if (lightningCount.value > headline.length - 1) {
      lightningCount.value = 0;
    }
  });
  let textState = $state(text[0]);
  let TickerClickCount = $state(0);

  // functions
  function advanceTickerClick() {
    TickerClickCount++;
    if (TickerClickCount === ticker.length) {
      TickerClickCount = 0;
    }
  }
  function reverseTickerClick() {
    TickerClickCount--;
    if (TickerClickCount < 0) {
      TickerClickCount = ticker.length - 1;
    }
  }
  function handleKeyDown(event: KeyboardEvent) {
    if (
      event.key === "Enter" ||
      event.key === "ArrowRight" ||
      event.key === "ArrowDown"
    ) {
      event.preventDefault();
      advanceTickerClick();
    }
    if (event.key === "ArrowLeft") {
      reverseTickerClick();
    }
  }
</script>

<svelte:body onkeydown={handleKeyDown} />

<div
  class="page-x-padding py-8 w-full md:grid md:grid-cols-2 md:h-full md:items-start min-h-[calc(100vh-6rem)] relative"
>
  <!-- column 1 -->
  <div
    class="
				gap-y-6
				grid
				grid-cols-1
				h-auto
				items-center
				sm:pr-20
				sm:text-left
				text-center
				w-full
				sm:max-w-lg
				md:pr-8
				lg:gap-y-6
				pt-12"
  >
    <div class="flex items-end gap-">
      <h1
        title="If you don't like this headline, feel free to edit it."
        class="text-30px lg:text-44px font-serif font-semibold leading-tight text-maximumYellow text-balance text-pretty max-w-fit"
      >
        {headline[headlineIndex]}
      </h1>
    </div>
    <p
      class="
					text-17px
					text-accent
					leading-7"
    >
      {@html textState}
    </p>
  </div>

  <!-- column 2 -- image content -->
  <div
    class="
				flex
				h-auto
				justify-center
				max-w-sm
				pointer-events-none
				py-8
				relative
				w-full
				md:p-0
				lg:max-w-sm
				xl:justify-start
				xl:max-w-lg"
  >
    <!-- <GraphicDots /> -->
    <GraphicDots />
  </div>
  <div
    class="absolute bottom-8 w-screen page-x-padding grid grid-cols-1 place-items-center"
  >
    {#if ticker[TickerClickCount]}
      <div
        class="text-center font-serif text-balance text-pretty text-maximumYellow mb-5 w-full bg-blue-200/5 rounded p-4"
      >
        {ticker[TickerClickCount].replace(
          "{{count}}",
          TickerClickCount.toString(),
        )}
      </div>
    {/if}
    <div class="flex items-center justify-center w-full">
      <button
        class=" text-maximumYellow hover:bg-maximumYellow hover:text-oxford rounded-full border flex items-center justify-center aspect-square w-12 h-12 leading-none font-mono"
        onclick={advanceTickerClick}>{TickerClickCount}</button
      >
    </div>
  </div>
</div>
