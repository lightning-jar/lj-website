<script lang="ts">
// components
import LightningBolt from "$components/LightningBolt.svelte";
import LightningButton from "$components/LightningButton.svelte";
import LinkButton from "$components/LinkButton.svelte";

// types
interface TopicCta {
	label: string;
	href: string;
	title?: string;
}
interface Topic {
	heading: string;
	text: string[];
	bullets?: string[];
	ctas?: {
		primary?: TopicCta;
		secondary?: TopicCta;
	};
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
		// event.key === "Enter" ||
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
  class="
  border-b
  border-white/10
  page-x-padding
  pb-4
  w-full
  grid
  grid-cols-[minmax(0,640px)_1fr]
  xl:grid-cols-[minmax(0,48rem)_1fr]
  2xl:grid-cols-[minmax(0,56rem)_1fr]
  h-full
  items-start
  min-h-[calc(100vh-6rem)]
  relative
  lg:py-8"
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
				lg:max-w-none
				pt-12"
  >
    {#each topics as topic, index}
      <!-- the first (default-visible) headline is the page's h1; the
           rotating alternates are h2s so each panel keeps heading
           semantics (they are display:none until selected, so assistive
           tech only encounters the active one) -->
      {@const headingTag = index === 0 ? "h1" : "h2"}
      {#if index > -1}
        <!-- heading -->

        <svelte:element
          this={headingTag}
          class="{counters.topic === index ? 'flex' : 'hidden'}
          heading-1
          mb-7
          border-y
          border-transparent
          [border-image:linear-gradient(90deg,_hsla(64,94%,58%,0.6),_hsla(64,94%,58%,0.6),_hsla(64,94%,58%,0.6))_1]
          p-[20px_0px_24px_0px]"
        >
          <span class="block w-[calc(100%-64px)]">{topic.heading}</span>
        </svelte:element>

        <!-- text -->
        {#each topic.text as text}
          <div
            class="{counters.topic === index ? 'block' : 'hidden'}
            body-1
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
              <li class="leading-snug opacity-95">{bullet}</li>
            {/each}
          </ul>
        {/if}

        <!-- ctas -->
        {#if topic.ctas?.primary || topic.ctas?.secondary}
          <div
            class="{counters.topic === index ? 'flex' : 'hidden'}
            flex-wrap
            gap-3
            mt-2"
          >
            {#if topic.ctas.primary}
              <LinkButton
                classes="button-accent"
                link={{
                  href: topic.ctas.primary.href,
                  title: topic.ctas.primary.title ?? topic.ctas.primary.label,
                }}
              >
                {topic.ctas.primary.label}
              </LinkButton>
            {/if}
            {#if topic.ctas.secondary}
              <LinkButton
                classes="text-yellow-50"
                link={{
                  href: topic.ctas.secondary.href,
                  title: topic.ctas.secondary.title ?? topic.ctas.secondary.label,
                }}
              >
                {topic.ctas.secondary.label}
              </LinkButton>
            {/if}
          </div>
        {/if}
      {/if}
    {/each}

    <!-- panel position dots -->
    {#if topics.length > 1}
      <nav aria-label="Messages" class="flex items-center gap-0.5 mt-8">
        {#each topics as topic, index}
          <!-- 24px hit area (WCAG 2.5.8 / Lighthouse touch-target
               minimum); the visual dot is the inner span -->
          <button
            type="button"
            title={topic.heading}
            aria-label="Go to message {index + 1} of {topics.length}: {topic.heading}"
            aria-current={counters.topic === index ? "true" : undefined}
            onclick={() => (counters.topic = index)}
            class="group w-6 h-6 flex items-center justify-center"
          >
            <span
              class="w-2.5 h-2.5 rounded-full border transition-colors {counters.topic ===
              index
                ? 'bg-maximumYellow border-maximumYellow'
                : 'bg-transparent border-maximumYellow/50 group-hover:bg-maximumYellow/40'}"
            ></span>
          </button>
        {/each}
      </nav>
    {/if}

    <LightningButton
      ariaLabel="go to next topic"
      character="arrow"
      containerClasses="w-8 h-8 items-center !absolute top-32 sm:top-18 right-0 lg:right-4"
      classes="
            border
            border-maximumYellow
            bg-maximumYellow
            p-9px
            text-oxford
            hover:bg-transparent
            hover:text-maximumYellow"
      enableClickMe={false}
      onclick={() => {
        incrementCounter("topic", topics.length);
      }}
      useImage={false}
    />
  </div>

  <!-- column 2 -->
  <div
    class="
				flex
				h-full
				justify-end
				items-start"
  ></div>

  <!-- ticker (renders only when ticker content is provided) -->
  {#if ticker.length}
  <aside
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
  </aside>
  {/if}
</div>
