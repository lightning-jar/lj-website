<script lang="ts">
	// stores
	import { width } from "$stores/windowStore";

	// components
	import AnimatedText from "$atoms/AnimatedText.svelte";
	import BlinkingCursor from "$atoms/AnimatedCursor.svelte";
	import { onMount } from "svelte";

	// types
	interface AnimatedHeadline {
		animatedWords: string[];
		staticBegin: string;
		staticEnd?: string;
	}
	// props
	export let classes = "";
	export let animatedHeadline: AnimatedHeadline = {
		animatedWords: [],
		staticBegin: "",
		staticEnd: "",
	};
	$: staticBegin = animatedHeadline.staticBegin ?? "";
	$: staticEnd = animatedHeadline.staticEnd ?? "";
	$: animatedWords = animatedHeadline.animatedWords ?? [];

	// text-4xl md:text-[5vw] lg:text-[4.65vw] xl:text-[4vw] 2xl:text-7xl leading-[1.25]
</script>

<template lang="pug">
	//- headline
	div(class!="{ classes }", aria-hidden="true")
		span {  @html staticBegin  }&nbsp;

		//- static end
		//- span.text-maximumYellow.underline.underline-offset-8.ml-2.inline-block(
		//- 	class="sm:hidden"
		//- ) { staticEnd }

		span(class="sm:block md:inline-block lg:block xl:inline-block")
			//- animated text
			+if('animatedWords[0]')
				span.hidden(class="sm:inline-block")
					AnimatedText(animatedWords!="{ animatedWords }")

			//- fake cursor
			+if('animatedWords[0]')
				span.hidden(class="sm:inline-block")
					BlinkingCursor
</template>
