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
	import IconServices from "$atoms/IconServices.svelte";
	import MediaPlayer from "$organisms/MediaPlayer.svelte";
	import OpenGraph from "$atoms/OpenGraph.svelte";
	import StructuredData from "$atoms/StructuredData.svelte";
	import WindowUpdater from "$molecules/WindowStoreUpdater.svelte";
	import VideoEmbed from "$molecules/VideoEmbed.svelte";
	import Slider from "$molecules/Slider.svelte";
	import Testimonial from "$molecules/Testimonial.svelte";
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
				pt-0
				relative
				text-neutral-100
				sm:pt-16
				lg:grid-cols-2
				lg:items-center
				lg:pt-20
				lg:gap-x-6
				xl:gap-x-8
				xl:pb-[8vw]`
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
					sm:max-w-sm
					sm:pr-20
					sm:text-left
					md:max-w-sm
					md:pr-8
					lg:max-w-md
					xl:place-self-start
					xl:pt-12
					xl:gap-y-8`
			)
				//- animated headline
				+if('data?.content?.banner?.animatedHeadline?.animatedWords[0]')
					AnimatedHeadline(
						classes=`
						font-bold
						hidden
						leading-snug
						sm:block
						text-[2em]`,
						animatedHeadline!="{ data.content.banner.animatedHeadline }"
					)

				//- banner text
				+if('data?.content?.banner?.text')
					h1(
						class=`
						hidden
						leading-relaxed
						tracking-wide
						opacity-90
						sm:block
						md:text-19
						xl:text-20`
					)
						| { data.content.banner.text }

			//-column 2 -- image content
			div(
				class=`
					flex
					h-full
					justify-center
					py-4
					px-8
					relative
					w-full
					sm:px-0
					sm:max-w-[320px]
					sm:translate-x-[200px]
					md:max-w-[360px]
					md:translate-x-[300px]
					lg:translate-x-0
					xl:place-self-center
					xl:max-w-xs`,
				aria-hidden="true"
			)
				GraphicDots
				ImageTigers

			//- mobile banner text
			div(class="mt-8 text-maximumYellow text-[1.4em] font-bold text-center mb-3 sm:hidden") {  @html data.content.banner.staticHeadline  }

			//- mobile p
			+if('data?.content?.banner?.text')
				h1.text-center.leading-relaxed(class="sm:hidden xl:text-20 opacity-90") { data.content.banner.text }

	//- Overview Section
	+if('data?.content?.overviewSection')
		section#overview(class=`
			justify-center
			relative
			text-neutral-100
			w-full
		`)
			//- overview -- top transition shape
			.background-gradient-oxford(class!="h-[12vw]"): svg(
				class="h-full w-full fill-neutral-50/[1%] rotate-180",
				preserveAspectRatio="none",
				viewBox="0 0 500 500"
			): polygon(
				points="0,0 0,500 500,0"
			)
			//- overview -- touts
			div(
				class=`
					bg-neutral-50/[1%]
					grid
					grid-cols-1
					gap-y-8
					items-center
					page-x-padding
					py-20
					lg:gap-x-8
					lg:grid-cols-[1fr,24px,1fr]
					xl:pt-8
					xl:pb-16
					`
			)
				+each('data?.content?.overviewSection?.touts as item, index')
					div(
						class!=`
							max-w-md
							items-top
							justify-self-center
							text-center
							lg:max-w-sm
							{ index === 0 ? 'lg:justify-self-start lg:text-left' : 'lg:text-right lg:justify-self-end' }`
					)
						//- heading
						h2(
							class=`
								font-bold
								leading-relaxed
								mb-2
								text-32
								sm:text-[2em]
								`
						) { item.heading }

						//- subheading
						.px-6(
							class=`
								italic
								text-[1.125em]
								text-maximumYellow
								font-semibold
								font-sans
								mb-4
								opacity-90
								sm:px-0
								`
						) {  @html item.subheading  }

						//- paragraph
						p.opacity-90.leading-relaxed(class="opacity-90") { item.text }

					//- plus
					+if('index === 0')
						.justify-self-center(class="md:block text-[2.5em] w-fit") +

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

			//- video player caption
			.text-center
				.mb-2.font-sans.opacity-80(class="text-[0.8em]") What we're watching this week:
				.italic.font-medium "Svelte Origins: A Javascript Documentary"

	//- Services Section
	+if('data?.content?.servicesSection')
		section#services(
			class=`
				page-x-padding
				py-20
				relative
				sm:py-24
				md:py-36`
		)
			//- services heading
			h2(
				class=`
					font-sans
					mb-20
					text-center
					text-maximumYellow
					text-[1.125em]
					tracking-widest
					lg:mb-28
					xl:mb-24
					uppercase`
			) {  @html data?.content?.servicesSection?.heading ?? ''  }

			//- services tiles grid
			+if('data?.content?.servicesSection?.tiles[0]')
				+const('tiles = data.content.servicesSection.tiles')
				div(
					class=`
						gap-y-20
						grid
						grid-cols-1
						items-start
						text-center
						lg:grid-cols-2
						lg:gap-16
						xl:grid-cols-3`
				)
					+each('tiles as tile')
						//- tile
						div(class="grid grid-cols-1 gap-y-4 place-items-center items-start xl:gap-y-6")
							//- icon
							+if('tile.iconSlug')
								IconServices(
									classes=`
										opacity-90
										hover:opacity-100
										transition-opacity
										w-[4em]`,
									slug!="{ tile.iconSlug }"
								)
							+if('tile.heading || tile.text')
								div(class="max-w-sm xl:max-w-none")
									//- heading
									+if('tile.heading')
										h3(
											class=`
											font-bold
											mb-4
											text-[1.65em]
											xl:text-[1.25em]`
										) {  @html tile.heading  }

									//- text
									+if('tile.text')
										p(class="opacity-90") {  @html tile.text  }

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

	//- Testimonials Section
	+if('data?.content?.testimonialsSection')
		section#testimonials(
			class=`
			border-y
			border-neutral-100/10
			flex
			h-screen
			items-center
			justify-center
			page-x-padding
			relative
			sm:block
			sm:h-screen
			sm:py-20
			sm:max-h-[860px]
			md:max-h-[900px]
			lg:max-h-[960px]
			xl:max-h-[1040px]
			2xl:max-h-[1080px]
			xl:h-auto`
		)
			Slider(
				classes!="",
				panels!="{ data?.content?.testimonialsSection?.testimonials }"
			)
				svelte:fragment(
					let:panel,
					slot="panel"
				)
					Testimonial(panel!="{ panel }")

	//- HomeCustomers
	//- HomeContact
</template>
