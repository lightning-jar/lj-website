<script lang="ts">
	export let classes = "";
</script>

<template lang="pug">
	//- use css radial gradient to create dots
	#dot-grid.pointer-events-none(
		class!="absolute text-maximumYellow bottom-0 right-0 w-2/5 aspect-square {classes}",
		aria-hidden="true",
		style="background-image: radial-gradient(currentColor 20%, transparent 20%); background-position: 0 0, 50%; background-size: 10% 10%"
	)
		//- polyfill for aspect ratio
		.h-0.w-full(class="pt-[100%]")
</template>
