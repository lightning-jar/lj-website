<script lang="ts">
	//- svelte
	import { fade } from "svelte/transition";

	//- functions
	function animateCursor() {
		setInterval(() => {
			cursorVisible = !cursorVisible;
		}, 350);
	}

	//- variables
	let cursorVisible = $state(false);

	//- run
	animateCursor();
</script>


	{#if cursorVisible}
		<span class="inline-block text-maximumYellow ml-2 bg-maximumYellow w-1 h-full scale-110 -translate-y-1 transition-transform origin-center" transition:fade> &nbsp;</span>
	{/if}

