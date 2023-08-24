<script lang="ts">
	// stores
	import { mediaPlayer, youTubeCode } from "$stores/mediaPlayerStore";

	// components
	import IconTriangleRight from "$atoms/IconTriangleRight.svelte";

	// props
	export let youTube = "";

	// local functions
	function launchPlayer() {
		$youTubeCode = youTube;
		$mediaPlayer = true;
	}
</script>

<template lang="pug">
	button.bg-titaniumYellow.text-oxfordBlue.px-4.py-2.flex.items-center.justify-center(
		class="sm:py-3 sm:px-6 rounded-tl-lg rounded-br-lg hover:shadow-lg transition-shadow",
		on:click|stopPropagation!="{ launchPlayer }"
	)
		.mr-3(class="w-[11px]")
			IconTriangleRight
		div
			slot
</template>
