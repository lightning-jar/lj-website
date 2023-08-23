<script lang="ts">
	// stores
	import { page } from "$app/stores";

	// components
	import AnimatedHeadline from "$molecules/AnimatedHeadline.svelte";
	import GraphicDots from "$atoms/GraphicDots.svelte";
	import ImageTigers from "$atoms/ImageTigers.svelte";
	import HomeBanner from "$organisms/HomeBanner.svelte";
	import HomeCustomers from "$organisms/HomeCustomers.svelte";
	import HomeOverview from "$organisms/HomeOverview.svelte";
	import HeadMeta from "$molecules/AnimatedHeadline.svelte";
	import HomeServices from "$organisms/HomeServices.svelte";
	import HomeTestimonials from "$organisms/HomeTestimonials.svelte";
	import HomeContact from "$organisms/HomeContact.svelte";
	import MediaPlayer from "$organisms/MediaPlayer.svelte";
	import OpenGraph from "$atoms/OpenGraph.svelte";
	import StructuredData from "$atoms/StructuredData.svelte";
	import WindowUpdater from "$molecules/WindowStoreUpdater.svelte";
	import VideoEmbed from "$molecules/VideoEmbed.svelte";
	import TileServices from "$molecules/TileServices.svelte";
	// import TransitionShapeBottom from "$molecules/TransitionShapeBottom.svelte";
	import TransitionShapeTop from "$molecules/TransitionShapeTop.svelte";
	// types
	import type { PageData } from "./$types";

	export let data: PageData;
	$: console.log("data", data);

	// content for open graph
	// const og = {
	// 	type: "website",
	// 	url: "https://lightningjar.com",
	// 	title: "Lightning Jar",
	// 	description:
	// 		"Lightning Jar is a technology studio & digital agency helping businesses thrive in a world that is more digital &amp; mobile every day",
	// 	images: [
	// 		{
	// 			src: "https://lightningjar.com/images/lightning-jar-og.jpg",
	// 			alt: "Lightning Jar Logo",
	// 			width: "800",
	// 			height: "600",
	// 		},
	// 	],
	// };
</script>

<template lang="pug">
	//- OpenGraph(
	//- 	description!="{ og.description }",
	//- 	images!="{ og.images }",
	//- 	title!="{ og.title }",
	//- 	type!="{ og.type }",
	//- 	url!="{ og.url }"
	//- )
	//- StructuredData
	//- MediaPlayer

	//- HomeBanner
	+if('data?.content?.banner')
		section#banner(
			class=`
				bg-gradient-to-r
				font-serif
				from-oxford
				page-x-padding
				pb-[14vw]
				pt-24
				relative
				text-neutral-100
				text-18
				to-oxford
				top-0
				via-oxfordDark
				w-full
				md:grid
				md:grid-cols-2
				md:items-center`
		)
			//- column 1
			div(
				class=`
					gap-y-8
					grid
					grid-cols-1
					h-auto
					items-center
					text-center
					w-full
					sm:max-w-md
					sm:pr-20
					sm:text-left
					md:pr-8
					lg:gap-y-10`
			)
				//- animated headline
				+if('data?.content?.banner?.animatedHeadline?.animatedWords[0]')
					+const('animatedHeadline = data.content.banner.animatedHeadline')
					AnimatedHeadline(animatedHeadline!="{ animatedHeadline }")

				//- banner text
				+if('data?.content?.banner?.text')
					h1.leading-normal(class="xl:text-20") { data.content.banner.text }

			//-column 2 -- image content
			div(
				class=`
					flex
					h-full
					justify-center
					max-w-sm
					md:p-0
					py-8
					relative
					w-full
					lg:max-w-sm
					xl:justify-start
					xl:max-w-lg`
			)
				GraphicDots
				ImageTigers

	//- Overview Section
	+if('data?.content?.overviewSection')
		section#overview(
			class=`
			bg-neutral-100
			flex
			justify-center
			page-x-padding
			relative
			text-oxford
			w-full
		`
		)
			//- transition shape
			TransitionShapeTop(classes="text-neutral-100 rotate-180 -translate-y-[12vw]")

			//- touts
			.pb-20(class="py-20 pb-20")
				.relative.text-oxfordBlue(class="grid-cols-3 md:grid pb-20 py-20 ")
					+each('data?.content?.overviewSection?.touts as item, index')
						div(
							class!="max-w-md lg:max-w-lg font-serif { index === 0 ? 'lg:pl-8' : 'text-right lg:pr-8' }"
						)
							//- heading
							h2(
								class=`
								mb-4
								sm:text-[2.25rem]
								lg:text-[2.5rem]
								xl:text-[3rem]
								font-bold
								text-4xl
								`
							) { item.heading }

							//- subheading
							div(
								class=`
								italic
								text-18
								sm:text-16
								lg:text-17
								text-oxfordDark
								font-bold
								font-sans
								mb-4
								opacity-90
								`
							)
								| { item.subheading }

							//- paragraph
							p.text-18.opacity-90(class="sm:text-16") { item.text }

						//- plus
						+if('index === 0')
							.flex.w-full.h-full.justify-center.items-center
								div(class="font-normal text-[50px] text-androidGreen") +

	//- Video Section
	+if('data?.content?.videoSection')
		section#video-section(
			class=`
				bg-neutral-100
				grid
				grid-cols-1
				pb-16
				page-x-padding
				place-items-center
				place-content-center
				pt-4
				relative
				`
		)
			VideoEmbed(
				classes=`
						border-primary
						border-t
						flex
						justify-center
						lg:border-none
						lg:max-w-[70vw]
						mb-6
						relative
						w-full`,
				thumbnailSrc!="{ data?.content?.videoSection?.thumbnailSrc }",
				youTube!="{ data?.content?.videoSection?.youTubeCode }"
			)
	//- Services Section
	+if('data?.content?.servicesSection')
		section#services(
			class=`
				bg-gradient-to-b
				border-b
				border-white/20
				from-oxfordDark
				page-x-padding
				py-24
				relative
				text-neutral-100
				to-oxfordDark
				via-oxford
				sm:py-24
				md:py-36`
		)
			//- services heading
			h2(
				class=`
					pb-10
					font-sans
					text-18
					text-center
					text-maximumYellow
					tracking-widest
					uppercase
					sm:pb-12
					sm:text-17
					md:mb-10
					md:text-18
					md:text-left
					lg:text-19
					xl:text-20
					2xl:text-24`
			) {  @html data?.content?.servicesSection?.heading ?? ''  }

			//- services tiles grid
			+if('data?.content?.servicesSection?.tiles[0]')
				+const('tiles = data.content.servicesSection.tiles')
				.hidden.gap-12.grid-cols-2.mb-20(class="md:grid lg:gap-16 xl:grid-cols-3")
					+each('tiles as tile')
						TileServices(
							outerClasses="mb-8 sm:mb-16 md:mb-0",
							tile!="{ tile }"
						)

			//- services tiles slider
			+if('data?.content?.servicesSection?.tiles[0]')
				//- slider
				//- div(class="md:hidden")
				//- 	Slider(
				//- 		classes!="{ '' }",
				//- 		panels!="{ tiles }"
				//- 	)
				//- 		div(
				//- 			class="",
				//- 			let:panel,
				//- 			slot="panel"
				//- 		)
				//- 			TileServices(
				//- 				heading!="{ panel.heading }",
				//- 				iconSlug!="{ panel.iconSlug }",
				//- 				text!="{ panel.text }"
				//- 			)

	//- HomeTestimonials
	//- HomeCustomers
	//- HomeContact

	//- HeadMeta(
	//- 	additionalLinkTags!="{ headAttributes.additionalLinkTags }",
	//- 	additionalMetaTags!="{ headAttributes.additionalMetaTags }",
	//- 	metaDescription!="{ headAttributes.metaDescription }",
	//- 	metaKeywords!="{ headAttributes.metaKeywords }",
	//- 	metaNofollow!="{ headAttributes.metaNofollow }",
	//- 	metaNoindex!="{ headAttributes.metaNoindex }",
	//- 	metaSection!="{ headAttributes.metaSection }"
	//- )
</template>
