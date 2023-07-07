<script lang="ts">
	// components
	import IconChevronDown from "$atoms/IconChevronDown.svelte";

	// types
	import type { NavDataItem } from "$types/navTypes";

	// props
	export let navItem: NavDataItem;

	// variables
	const label = navItem.label;
	const items = navItem.items;
</script>

<template lang="pug">
	.relative.group.ml-10
		//- nav menu button

		button.text-white.text-opacity-80.bg-transparent.rounded-md.inline-flex.items-center.transition-opacity(
			class="group-hover:text-opacity-100 group-focus-within:text-opacity-100 !outline-none underline-offset-4 focus:underline decoration-white/60 ",
			aria-expanded="false",
			type="button"
		)
			span { label }
			//span.w-4.h-4
				IconChevronDown

		//- flyout
		.absolute.z-10.-ml-4.pt-6.px-2.w-auto.opacity-0.transition-opacity.pointer-events-none(
			class="group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 min-w-[11.625rem] sm:px-0 lg:ml-0 lg:left-1/2 lg:-translate-x-1/2"
		)
			.rounded-lg.shadow-lg.ring-1.ring-black.ring-opacity-5.overflow-hidden
				.relative.grid.gap-0.px-2.py-2(
					class=" bg-[#61a10e] sm:gap-0 sm:px-2 sm:pt-2 sm:pb-4"
				)
					+each('items as item')
						a.px-2.py-1.flex.items-center.rounded-lg.text-opacity-80.transition-opacity(
							class="text-white hover:underline hover:bg-opacity-10 hover:text-opacity-100 focus:underline underline-offset-4 decoration-white/40 focus:text-opacity-100 transition-colors !outline-none xl:pb-0",
							href!="{ item.slug ? '/' + item.slug : item.url }"
						)
							.text-base.peer(class="xl:text-sm") { item.label }
							.pl-2.flex.items-center.h-full.opacity-0.flex-grow(
								class="hover:opacity-100 peer-hover:opacity-100 peer"
							)
								.w-4.h-4.-rotate-90.text-accent
									IconChevronDown
</template>
