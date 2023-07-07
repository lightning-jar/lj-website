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
	let cursorVisible = false;

	//- run
	animateCursor();
</script>

<template lang="pug">
	+if('cursorVisible')
		span.inline-block.text-maximumYellow.ml-2.bg-maximumYellow.w-1.h-full.scale-110(
			class="-translate-y-1",
			transition:fade
		) &nbsp;
</template>
