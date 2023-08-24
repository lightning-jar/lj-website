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
				grid
				grid-cols-1
				page-x-padding
				pb-[10vw]
				pt-10
				relative
				text-neutral-100
				text-18
				sm:pt-16
				md:grid-cols-2
				md:items-center
				md:pt-20
				xl:pt-24`
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
					AnimatedHeadline(
						animatedHeadline!="{ data.content.banner.animatedHeadline }"
					)

				//- banner text
				+if('data?.content?.banner?.text')
					h1.hidden.leading-relaxed(class="sm:block text-19 xl:text-20 opacity-90") { data.content.banner.text }

			//-column 2 -- image content
			.px-6(
				class=`
					flex
					h-full
					justify-center
					max-w-sm
					md:p-0
					py-8
					relative
					w-full
					sm:px-0
					lg:max-w-sm
					xl:justify-start
					xl:max-w-lg`
			)
				GraphicDots
				ImageTigers

			//- mobile p
			+if('data?.content?.banner?.text')
				h1.mt-8.text-center.leading-relaxed(class="sm:hidden text-19 xl:text-20 opacity-90") { data.content.banner.text }

	//- Overview Section
	+if('data?.content?.overviewSection')
		section#overview(class=`
			justify-center
			relative
			text-neutral-100
			w-full
		`)
			//- transition shape
			//- TransitionShapeTop(
			//- 	classes="!text-maximumYellow/40 rotate-180 //-translate-y-[12vw]"
			//- )
			//- transition shape
			div(class!="h-[12vw] background-gradient-oxford"): svg(
				class="h-full w-full fill-neutral-50/[1%] rotate-180",
				preserveAspectRatio="none",
				viewBox="0 0 500 500"
			): polygon(
				points="0,0 0,500 500,0"
			)

			//- touts
			div(
				class="bg-neutral-50/[1%] w-full grid grid-cols-1 sm:grid-cols-3 page-x-padding md:grid pb-20 py-20 items-center"
			)
				+each('data?.content?.overviewSection?.touts as item, index')
					div(
						class!="text-center max-w-md lg:max-w-md { index === 0 ? 'justify-self-start sm:text-left' : 'sm:text-right justify-self-end' }"
					)
						//- heading
						h2(
							class=`
								mb-2
								sm:text-[2.25rem]
								lg:text-[2.5rem]
								xl:text-[3rem]
								leading-relaxed
								font-bold
								text-32
								`
						) { item.heading }

						//- subheading
						.px-6(
							class=`
								italic
								text-19
								sm:text-16
								lg:text-17
								text-maximumYellow
								font-bold
								font-sans
								mb-4
								opacity-90
								`
						) { item.subheading }

						//- paragraph
						p.text-19.opacity-90.leading-relaxed(class="sm:text-16 opacity-90") { item.text }

					//- plus
					+if('index === 0')
						.justify-self-center.text-neutral-100(class="py-4 text-40 sm:text-50") +

	//- Video Section
	+if('data?.content?.videoSection')
		section#video-section(
			class=`
				bg-neutral-100/[1%]
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
				border-b
				border-white/20
				from-oxfordDark
				page-x-padding
				py-24
				relative
				text-neutral-100
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
