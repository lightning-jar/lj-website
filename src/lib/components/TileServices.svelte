<script lang="ts">
// components
import IconServices from "$components/IconServices.svelte";

// types
import type { Tile } from "$types/types";

// props
let { outerClasses = "", tile }: { outerClasses: string; tile: Tile } =
	$props();
</script>

<div class="w-full h-auto md:flex xl:block 2xl:block { outerClasses }">
	<!-- icon-->
	{#if tile.iconSlug}
		<div
			class="
				flex-none
				mb-4
				opacity-90
				hover:opacity-100
				transition-opacity
				flex
				justify-center
				md:w-14
				md:mr-8
				xl:mr-auto">
			<IconServices
				slug={ tile.iconSlug }
			/>
		</div>
	{/if}
	{#if tile.heading || tile.text}
		<div class="mb-16 sm:mb-0 max-w-sm">
			<!-- heading -->
			{#if tile.heading}
				<h3
					class="text-center mb-5 font-serif font-bold md:text-left text-2xl text-cultured"
				> {@html tile.heading}</h3>
			{/if}

			<!-- text -->
			{#if tile.text}
				<p
					class="text-center md:text-left text-[1.2rem] leading-normal text-cultured/90 font-serif font-normal md:pr-0"
				> {@html tile.text}</p>
			{/if}
		</div>
	{/if}
</div>

