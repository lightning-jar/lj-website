<script lang="ts">
	// components
	import IconServices from "$atoms/IconServices.svelte";

	// props
	export let iconSlug = "";
	export let heading = "";
	export let text = "";

	// constants
	const slug = iconSlug;
</script>

<template lang="pug">
	.w-full.h-auto(class="md:flex xl:block 2xl:block")
		.w-full(
			class="flex-none mb-4 opacity-90 hover:opacity-100 transition-opacity flex justify-center md:w-14 md:mr-8 xl:mr-auto"
		)
			IconServices({slug})
		.mb-16(class="sm:mb-0 max-w-sm")
			h3.text-center.mb-5.font-serif.font-bold(class="md:text-left text-2xl text-cultured")
				| {  @html heading  }
				span
					slot(name="heading")
			p(
				class="text-center md:text-left text-[1.2rem] leading-normal text-cultured/90 font-serif font-light md:pr-0"
			)
				| {  @html text  }
				span
					slot(name="text")
</template>
