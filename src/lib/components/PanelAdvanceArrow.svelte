<script lang="ts">
// Yellow arrow that fires the lightning-bolt animation and advances the
// active panel. Shared by /services and /testimonials.
import LightningButton from "$components/LightningButton.svelte";

// props
let { onadvance }: { onadvance: () => void } = $props();

function clickLightningButton() {
	const lightningButton = document.querySelector(
		"[data-lightning-button]",
	) as HTMLButtonElement;
	lightningButton?.click();
}
</script>

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
      onadvance();
    }}
  />
</div>
