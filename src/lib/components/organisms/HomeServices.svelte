<script lang="ts">
	//components
	import IconServices from "$atoms/IconServices.svelte";
	import TextHeading from "$atoms/TextHeading.svelte";
	import SectionDark from "$molecules/SectionDark.svelte";
	import TileServices from "$molecules/TileServices.svelte";
	import Slider from "$molecules/Slider.svelte";

	// props
	export let tiles: Tile[] = [];
	export let heading = "";

	interface Tile {
		heading: string;
		iconSlug: string;
		text: string;
	}
	// const tiles: Tile[] = [
	// 	{
	// 		heading: "Web&nbsp;Design &<br> Development",
	// 		iconSlug: "icon-web-design",
	// 		text: "Our user-focused approach to web design and development is engineered to help your organization quickly strategize, prioritize, and execute digital experiences that matter to customers.",
	// 	},
	// 	{
	// 		heading: "Custom&nbsp;Software<br>  & Mobile Apps",
	// 		iconSlug: "icon-custom-software",
	// 		text: "Companies with great ideas on how to digitize their services or solutions, or solve a business challenge through custom software often need help turning their vision into reality. That's where we come in.",
	// 	},
	// 	{
	// 		heading: "eCommerce,&nbsp;PIM<br> DAM, MDM",
	// 		iconSlug: "icon-ecommerce",
	// 		text: `Our technology studio specializes in PIM, DAM, MDM implementations and eCommerce transformations leveraging the <a href="/blog/what-is-pimcore" class="text-underline">power of Pimcore</a> -- the world's most flexible and powerful unified digital platform.`,
	// 	},
	// 	{
	// 		heading: "Brand&nbsp;Identity&nbsp;&<br> Naming",
	// 		iconSlug: "icon-kiosk",
	// 		text: "New company? New Product? Let our branding and naming team help you uncover the perfect name, graphics and messaging to help your brand thrive in both digital and analog worlds.",
	// 	},
	// 	{
	// 		heading: "Sales & Pricing Tools",
	// 		iconSlug: "icon-sales-tools",
	// 		text: "What are the challenges and friction points slowing down your sales team or agents in the call center? Too often the sales organization is the last to benefit from digital transformations -- ask yourself what happens if you turn that equation around?",
	// 	},
	// 	{
	// 		heading: "UX Optimization",
	// 		iconSlug: "icon-ux",
	// 		text: "There's a big gap between usability and great user experience. Our user experience team can help you push beyond interfaces that simply work to best-in-class experiences that increase affinity, encourage sales and encourage customer loyalty.",
	// 	},
	// ];
</script>

<template lang="pug">
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
	) {  @html heading  }

	//- tiles grid
	.hidden.gap-12.grid-cols-2.mb-20(class="md:grid lg:gap-16 xl:grid-cols-3")
		+each('tiles as tile')
			TileServices(outerClasses="mb-8 sm:mb-16 md:mb-0")
				svelte:fragment(slot="icon"): IconServices(slug!="{ tile.iconSlug }")
				svelte:fragment(slot="heading") {  @html tile.heading  }
				svelte:fragment(slot="text") {  @html tile.text  }

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
</template>
