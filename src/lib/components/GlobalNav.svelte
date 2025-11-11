<script lang="ts">
	// components
	import ButtonHamburger from "$components/ButtonHamburger.svelte";
	import NavLogoBlock from "$components/NavLogoBlock.svelte";

	// types
	import type { NavItem } from "$types/types";

	// assets
	import { default as logoSVG } from "$assets/lightning-jar-logo.svg";

	// props
	let {isHome, nav}: {isHome: boolean; nav: NavItem[]} = $props();
</script>

	<header
		id="top"
		class="
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
			w-full
			xl:min-h-[3.5rem]
			z-0"
	>

		<NavLogoBlock />

		<ButtonHamburger />

		<nav
			class="
			hidden
			xl:flex
			xl:items-center
			xl:gap-x-12
			xl:pt-[.35rem]
			xl:min-h-[3.5rem]
			">

			{#each nav as item}
				<a
					class="
						block
						decoration-current
						opacity-[.95]
						!outline-none
						transition-opacity
						underline-offset-8
						hover: opacity-100
						hover:text-maximumYellow
						hover:underline
						focus: opacity-100
						focus:text-maximumYellow
						focus:underline"
					href={ item.href }
					title={ item.title }
				>{ item.label }</a>
			{/each}
		</nav>
	</header>

