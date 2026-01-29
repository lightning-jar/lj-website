<script lang="ts">
// import components
import LightningButton from "$components/LightningButton.svelte";

// props
let { id, classes }: { id?: string; classes?: string } = $props();

let triggerClick: undefined | (() => void) = $state(undefined);

function handleClick(_e: MouseEvent) {
	triggerClick?.();
}
</script>

<a
  {id}
  class="
  aspect-[432_64]
  gap-3%
  grid
  grid-cols-[85%_1fr]
  group/branding
  items-center
	group
	h-auto
	relative
	text-maximumYellow
	w-[10em]
	md:w-[12.5em]
	xl:w-[13em]
	hover:after:opacity-100
	focus:after:opacity-100
	{classes}"
  draggable="false"
  onclick={handleClick}
  href="/"
  title="Back to home"
>
  <span class="sr-only">Lightning Jar - Web Studio</span>
  <!-- lj wordmark -->
  <img
    alt="Lightning Jar Wordmark"
    class="w-full h-auto user-select-none"
    draggable="false"
    height="60"
    src="https://lj-01.nyc3.cdn.digitaloceanspaces.com/images/logos/lightning-jar-word.svg"
    width="364"
  />

  <!-- lightning bolt in inert mode -->
  <LightningButton
    containerClasses="w-26px sm:w-8 lg:w-9 group-hover/branding:scale-125 transition-transform"
    bind:triggerClick
    tag="div"
    useImage={false}
  />
</a>
