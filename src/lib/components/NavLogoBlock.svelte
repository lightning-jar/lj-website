<script lang="ts">
// import components
import LightningButton from "$components/LightningButton.svelte";

// props
let { id, classes }: { id?: string; classes?: string } = $props();

let lightningState = $state("inactive"); // default | active

function lightningStrike() {
	document.body.classList.add("lightning");
	lightningState = "active";
	// after 1 x seconds revert to inactive using timeout
	setTimeout(() => {
		lightningState = "inactive";
	}, 100);
	setTimeout(() => {
		document.body.classList.remove("lightning");
	}, 300);
}

function handleBoltClick() {
	lightningStrike();
}
</script>

<div
  {id}
  class="
  aspect-[432_64]
  //flex
  gap-3%
  grid
  grid-cols-[85%_1fr]
  items-center
	group
	h-auto
	!outline-none
	relative
	text-maximumYellow
	underline-offset-8
	w-[10em]
	md:w-[12.5em]
	xl:w-[13em]
	hover:after:opacity-100
	focus:after:opacity-100
	after:pointer-events-none
	after:opacity-0
	after:absolute
	after:inset-0
	after:border-b
	after:border-b-2
	after:border-current
	after:translate-y-2
	after:z-0
	{classes}"
  draggable="false"
>
  <span class="sr-only">Lightning Jar - Web Studio</span>
  <!-- lj wordmark -->
  <a class="w-full" href="/" title="Back to home">
    <img
      alt="Lightning Jar Wordmark"
      class="w-full h-auto user-select-none"
      draggable="false"
      height="60"
      src="https://lj-01.nyc3.cdn.digitaloceanspaces.com/images/logos/lightning-jar-word.svg"
      width="364"
    />
  </a>

  <!-- lightning bolt -->
  <div class="w-full text-maximumYellow flex items-center justify-center">
    <div class="bg-transparent w-26px sm:w-8 lg:w-9 aspect-square">
      <LightningButton
        ariaLabel="simulates a lightning flash on the screen and plays a sound - just for fun"
        character=""
        classes="hover:text-maximumYellow hover:scale-125 transition-transform"
      />
    </div>
  </div>
</div>
