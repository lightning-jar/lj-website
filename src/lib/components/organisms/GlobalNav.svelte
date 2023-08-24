<script lang="ts">
	// store api
	import { writable, type Writable } from "svelte/store";

	// context api
	import { setContext } from "svelte";

	// import components
	import ButtonHamburger from "$atoms/ButtonHamburger.svelte";

	// import stores
	import { mobileNavOpen } from "$stores/navStore";

	// import assets
	import { default as logoSVG } from "$assets/lightning-jar-logo.svg";

	// import types
	import type { NavItem } from "$types/types";

	// local store
	type BrandLinkStore = Writable<HTMLAnchorElement | null>;
	export const brandLinkStore: BrandLinkStore = writable(null);
	$: setContext("brandLinkStore", brandLinkStore);

	// props
	export let nav: NavItem[];
</script>

<template lang="pug">
	header#top(
		class=`
			bg-gradient-to-r
			from-oxford
			via-oxfordDark
			to-oxford
			flex
			items-center
			justify-between
			md:space-x-10
			min-h-[3.75rem]
			page-x-padding
			pt-4
			relative
			text-neutral-50
			xl:min-h-[3.5rem]
			z-0`
	)
		//- Logo
		a(
			class=`
			block
			group
			h-auto
			!outline-none
			relative
			text-maximumYellow
			underline-offset-8
			w-[9em]
			sm:w-[10em]
			lg:w-[12.5em]
			xl:w-[13em]
			hover:after:opacity-100
			focus:after:opacity-100
			after:pointer-events-none
			after:opacity-0
			after:absolute
			after:inset-0
			after:border-b
			after:border-b-2
			after:border-current
			after:translate-y-2
			after:z-0`,
			draggable="false",
			href="/",
			tile="Go to homepage"
		)
			span.sr-only Lightning Jar
			picture.w-full.h-full.flex
				source(
					srcset!="{ logoSVG }",
					type="image/svg+xml"
				)
				img(
					class=`
					block
					pointer-events-none
					`,
					alt="Lightning Jar Logo",
					draggable="false",
					height=30,
					src!="/images/lightning-jar-logo.png",
					width=200
				)
				//-.italic.text-sm Technology &amp; brand studio.

		ButtonHamburger

		//- main nav
		nav(
			class=`
			hidden
			--
			xl:flex
			xl:items-center
			xl:gap-x-12
			xl:pt-[.35rem]
			xl:min-h-[3.5rem]
			`
		)
			+each('nav as item')
				a(
					class=`
						block
						decoration-current
						opacity-[.95]
						!outline-none
						transition-opacity
						underline-offset-8
						--
						hover: opacity-100
						hover:text-maximumYellow
						hover:underline
						--
						focus: opacity-100
						focus:text-maximumYellow
						focus:underline
						--
						`,
					href!="{ item.href }",
					title!="{ item.title }"
				) { item.label }
</template>
