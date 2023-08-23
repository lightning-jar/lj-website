<script lang="ts">
	// types
	import type { Tile } from "$types/types";

	// components
	import IconServices from "$atoms/IconServices.svelte";

	// props
	export let outerClasses = "";
	export let tile: Tile;
</script>

<template lang="pug">
	.w-full.h-auto(class="md:flex xl:block 2xl:block")
		//- icon
		+if('tile.iconSlug')
			div(
				class=`
					flex-none
					mb-4
					opacity-90
					hover:opacity-100
					transition-opacity
					flex
					justify-center
					md:w-14
					md:mr-8
					xl:mr-auto`
			): IconServices(
				slug!="{ tile.iconSlug }"
			)
		+if('tile.heading || tile.text')
			.mb-16(class="sm:mb-0 max-w-sm")
				//- heading
				+if('tile.heading')
					h3.text-center.mb-5.font-serif.font-bold(
						class="md:text-left text-2xl text-cultured"
					) {  @html tile.heading  }

				//- text
				+if('tile.text')
					p(
						class="text-center md:text-left text-[1.2rem] leading-normal text-cultured/90 font-serif font-normal md:pr-0"
					) {  @html tile.text  }
</template>
