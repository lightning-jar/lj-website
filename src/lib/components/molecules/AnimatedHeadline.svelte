<script lang="ts">
	// stores
	import { width } from "$stores/windowStore";

	// components
	import AnimatedText from "$atoms/AnimatedText.svelte";
	import BlinkingCursor from "$atoms/AnimatedCursor.svelte";
	import { onMount } from "svelte";

	// variables
	export let staticBegin = "";
	export let staticEnd = "";
	export let animatedWords = [""];

	// text-4xl md:text-[5vw] lg:text-[4.65vw] xl:text-[4vw] 2xl:text-7xl leading-[1.25]
</script>

<template lang="pug">
	//- headline
	.font-serif.font-bold(
		class="text-[2rem] sm:text-[2.5rem] md:text-[3rem] lg:text-5xl xl:text-[3.25rem] !leading-[1.125]"
	)
		span(class="md:block") { staticBegin }&nbsp;
		span.text-maximumYellow.underline.underline-offset-8.ml-2.inline-block(
			class="sm:hidden"
		) { staticEnd }

		span(class="md:block leading-[1.2em]")
			//- animated text
			+if('$width > 640 && animatedWords[0]')
				AnimatedText({animatedWords})

			//- fake cursor
			+if('$width > 640')
				BlinkingCursor

			| &nbsp;
</template>
