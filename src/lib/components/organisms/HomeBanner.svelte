<script lang="ts">
	//- svelte
	import { onMount } from "svelte";

	//- components
	import AnimatedHeadline from "$molecules/AnimatedHeadline.svelte";
	import BannerHomeText from "$atoms/BannerHomeText.svelte";
	import ColumnsTwo from "$molecules/ColumnsTwo.svelte";
	import ImageDotGrid from "$atoms/ImageDotGrid.svelte";
	import ImageTigers from "$atoms/ImageTigers.svelte";
	import SectionDark from "$molecules/SectionDark.svelte";

	//- variables
	const headlineText = {
		animatedWords: ["LEO", "digital.", "mobile.", "remote.", "competitive."],
		staticBegin: "The world is <br>getting more",
		staticEnd: "digital.",
	};
	const bannerText =
		"Since 2004, Lightning Jar digital agency has been helping businesses thrive in a world that is more digital & mobile every day.";

	let imageContent: HTMLDivElement | null = null;

	// fade in image content
	$: {
		if (imageContent) imageContent.classList.add("!opacity-100");
	}
</script>

<template lang="pug">
	SectionDark(
		classes!="{ 'bg-gradient-to-tr from-oxford via-oxfordDark to-oxford !pt-24 pb-[12vw]' }"
	)
		.items-center(class="md:flex md:h-full")
			ColumnsTwo(classes!="{ 'py-8 w-full' }")
				//- column 1 -- text content
				.flex.text-center.select-none.items-center(
					class="h-full sm:text-left sm:pr-20 md:pr-8 w-full",
					slot="column-1"
				)
					//- col inner
					div(class="sm:max-w-md text-white")
						.mb-8(class="lg:mb-10")
							AnimatedHeadline(
								animatedWords!="{ headlineText.animatedWords }",
								staticBegin!="{ headlineText.staticBegin }",
								staticEnd!="{ headlineText.staticEnd }"
							)
						.mb-4
							BannerHomeText { bannerText }

				//-column 2 -- image content
				//-div.bg-white.w-full.h-24
				.opacity-0.transition-opacity.w-full(
					class="h-full w-full py-8 md:p-0 flex justify-center xl:justify-start",
					bind:this!="{ imageContent }",
					slot="column-2",
					style=""
				)
					//- col inner
					input.h-8.text-oxford
					.relative(
						class="max-w-sm lg:max-w-sm xl:max-w-lg",
						style=""
					)
						.absolute(class="bottom-0 right-0 w-2/5 h-1/3 -z-10")
							ImageDotGrid
						.static
							ImageTigers
</template>
