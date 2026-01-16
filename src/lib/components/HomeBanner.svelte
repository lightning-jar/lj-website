<script lang="ts">
// components
import LightningBolt from "$components/LightningBolt.svelte";
import LightningButton from "$components/LightningButton.svelte";

// types
interface Topic {
	heading: string;
	text: string[];
	bullets?: string[];
}
interface Props {
	topics?: Topic[];
	ticker?: string[];
}

// props
let { topics = [], ticker = [] }: Props = $props();

// local state
let counters: Record<string, number> = $state({
	topic: 0,
	ticker: 0,
});

// helpers
function clickLightningButton() {
	const lightningButton = document.querySelector(
		"[data-lightning-button]",
	) as HTMLButtonElement;
	lightningButton?.click();
}

function incrementCounter(counterName: string, counterLength: number): void {
	// return if arguments are invalid
	if (counters?.[counterName] === undefined || !counterLength) return;

	// reset counter if it approaches or exceeds limit
	if (counters[counterName] + 1 >= counterLength) {
		counters[counterName] = 0;
		return;
	}

	// increment counter
	counters[counterName] = counters[counterName] + 1;
}

function decrementCounter(counterName: string, counterLength: number): void {
	// return if arguments are invalid
	if (counters?.[counterName] === undefined || !counterLength) return;

	// reset counter if it approaches zero
	if (counters[counterName] - 1 < 0) {
		if (counterName === "topic") {
			counters[counterName] = topics.length - 1;
		} else if (counterName === "ticker") {
			counters[counterName] = ticker.length - 1;
		}
		return;
	}

	// increment counter
	counters[counterName] = counters[counterName] - 1;
}

function handleKeyDown(event: KeyboardEvent) {
	if (
		event.key === "Enter" ||
		event.key === "ArrowRight" ||
		event.key === "ArrowDown"
	) {
		event.preventDefault();
		clickLightningButton();
		incrementCounter("topic", topics.length);
	}
	if (event.key === "ArrowLeft") {
		event.preventDefault();
		clickLightningButton();
		decrementCounter("topic", topics.length);
	}
}
</script>

<svelte:body onkeydown={handleKeyDown} />

<div
  class="border-b
  border-white/10 page-x-padding pb-4 w-full grid grid-cols-[minmax(0,460px)_1fr] h-full items-start min-h-[calc(100vh-6rem)] relative lg:py-8 selector-[body.lightning]:[animation:shake_0.3s_ease-in-out_infinite]"
>
  <!-- primary content area -->
  <div
    class="
				grid
				grid-cols-1
				h-auto
				items-center
				relative
				w-full
				sm:max-w-lg
				pt-12"
  >
    {#each topics as topic, index}
      {@const headingTag = index === 0 ? "h1" : "h2"}
      {#if index > -1}
        <!-- heading -->

        <svelte:element
          this={headingTag}
          title="If you don't like this headline, feel free to edit it."
          class="{counters.topic === index ? 'flex' : 'hidden'}
          font-display
          text-34px
          font-400
          leading-tight
          mb-7
          text-maximumYellow
          text-balance
          text-pretty
          border-y
          border-transparent
          [border-image:linear-gradient(90deg,_hsla(64,94%,58%,0.6),_hsla(64,94%,58%,0.6),_hsla(64,94%,58%,0.6))_1]
          //border-white/30
          p-[20px_0px_24px_0px]
          //border-none
          uppercase
          text-shadow
          text-shadow-oxfordDark
          sm:text-48px"
        >
          <span class="block max-w-400px">{topic.heading}</span>
        </svelte:element>

        <!-- text -->
        {#each topic.text as text}
          <div
            class="{counters.topic === index ? 'block' : 'hidden'}
					font-sans
          text-17px
					leading-[1.65]
					text-yellow-50
					mb-6
					pl-0
					//opacity-95
					"
          >
            {@html text}
          </div>
        {/each}

        <!-- bullets -->
        {#if topic?.bullets?.[0]}
          <ul
            class="{counters.topic === index ? 'grid' : 'hidden'}
            gap-3
  					text-17px
  					text-accent
  					leading-7
  					list-disc
       	    list-outside
            grid-cols-1
  					pl-3"
          >
            {#each topic.bullets as bullet}
              <li class="leading-snug">{bullet}</li>
            {/each}
          </ul>
        {/if}
      {/if}
    {/each}

    <div class="absolute top-32 sm:top-18 right-0 lg:right-4 group">
      <div class="scale-[0.85] flex justify-left">
        <LightningButton
          onclick={() => {
            clickLightningButton();
            incrementCounter("topic", topics.length);
          }}
          classes="flex"
        />
      </div>
    </div>
  </div>

  <!-- column 2 -->
  <div
    class="
				flex
				h-full
				justify-end
				items-start"
  ></div>

  <!-- ticker -->
  <div
    class="
      absolute
      bottom-8
      gap-4
      grid-cols-1
      hidden
      h-48px
      page-x-padding
      place-content-start
      place-items-center
      w-screen
      sm:flex"
  >
    <div
      class="
        flex
        items-center
        justify-center
        w-full
        sm:w-auto"
    >
      <button
        title="Click me."
        class="
          text-maximumYellow
          hover:bg-maximumYellow
          hover:text-oxford
          rounded-full
          border
          flex
          items-center
          justify-center
          aspect-square
          w-8
          h-8
          p-10px
          leading-none
          font-mono"
        onclick={() => incrementCounter("ticker", ticker.length)}
        ><LightningBolt classes={"hover:text-oxford"} /></button
      >
    </div>

    {#if ticker[counters.ticker]}
      <div
        class="
          bg-transparent
          px-2
          py-3
          rounded
          text-balance
          text-maximumYellow
          text-pretty
          w-auto"
      >
        {ticker[counters.ticker].replace(
          "{{count}}",
          counters.ticker.toString(),
        )}
      </div>
    {/if}
  </div>
</div>
