<script lang="ts">
	//- svelte
	// import { onMount } from "svelte";

	//- components
	import AnimatedHeadline from "$molecules/AnimatedHeadline.svelte";
	import BannerHomeText from "$atoms/BannerHomeText.svelte";
	import ColumnsTwo from "$molecules/ColumnsTwo.svelte";
	import GraphicDots from "$atoms/GraphicDots.svelte";
	import SectionDark from "$molecules/SectionDark.svelte";
	import ImageTigers from "$atoms/ImageTigers.svelte";

	// types
	interface Banner {
		animatedHeadline: {
			animatedWords: string[];
			staticBegin: string;
			staticEnd?: string;
		};
		staticHeadline: string;
		text: string;
	}

	// props
	export let banner: Banner;

	//- variables
	$: animatedWords = banner?.animatedHeadline?.animatedWords ?? [];
	$: staticBegin = banner?.animatedHeadline?.staticBegin ?? "";
	$: staticEnd = banner?.animatedHeadline?.staticEnd ?? "";
	$: bannerText = banner?.text ?? "";
</script>

<template lang="pug">
	div(class="py-8 w-full md:grid md:grid-cols-2 md:h-full md:items-center")
		//- column 1
		div(
			class=`
				gap-y-8
				grid
				grid-cols-1
				h-auto
				items-center
				sm:pr-20
				sm:text-left
				text-center
				w-full
				sm:max-w-md
				md:pr-8
				lg:gap-y-10`
		)
			AnimatedHeadline(
				animatedWords!="{ animatedWords }",
				staticBegin!="{ staticBegin }",
				staticEnd!="{ staticEnd }"
			)
			//- headline text
			h1(class=`
					text-18
					text-neutral-100
					leading-7
					xl:text-20
					`) { bannerText }

		//-column 2 -- image content
		div(
			class="relative w-full h-full py-8 md:p-0 flex justify-center xl:justify-start max-w-sm lg:max-w-sm xl:max-w-lg"
		)
			GraphicDots
			ImageTigers
</template>
