<script lang="ts">
	import LightningBolt from "$a/LightningBolt.svelte";
	import WindowStoreUpdater from "$m/WindowStoreUpdater.svelte";
	import { scroll, height } from "$stores/windowStore";

	let bolt: HTMLDivElement;

	let boltWidth = "36";
	$: {
		if ($scroll > 0) {
			let factor = $scroll > 0 ? ($scroll / $height) * 200 : 0;
			if (factor > 200) factor = 200;
			bolt.style.transform = `scale(${factor.toString()})`;
		} else if (bolt) {
			bolt.style.transform = "scale(1)";
		}
	}

	// $: {  if ($scroll > width) { width = $scroll }
</script>

<template lang="pug">
	WindowStoreUpdater

	//- lightning bolt
	.fixed.w-screen.h-screen
		.flex.h-screen.justify-center.items-center.relative
			//- image container
			.w-8.flex.justify-center(
				class="transition-transform",
				bind:this!="{ bolt }",
				style!="{ 'width:' + boltWidth + 'px;' }"
			)
				LightningBolt
			.absolute.text-white(
				style!="{ 'margin-top:' + $height / 10 + 'px' }"
			)
				| We love it when things just work.
	section.h-screen.overflow-hidden.flex.justify-center.items-center(
		class="h-[400vh] bg-gradient-to-b from-oxford via-oxford to-white"
	)

	section.h-screen.bg-white
</template>
