<script lang="ts">
	// components
	import IconArrowRight from "$atoms/IconArrowRight.svelte";

	// types
	import type { NavMenuItem } from "$types/navTypes";

	// functions
	import { slugify } from "$functions/helperFunctions";

	// svelte functions
	import { createEventDispatcher } from "svelte";

	// props
	export let navMenuItem: NavMenuItem;

	// variables
	const dispatch = createEventDispatcher();

	// local functions
	const navItemClick = () => {
		dispatch("navItemClick", navMenuItem, {});
	};
</script>

<template lang="pug">
	.flex.justify-center.items-center.mb-0
		a.flex.justify-center.items-center(
			class="border-b border-transparent focus:border-slate-600 !outline-none",
			data-handle!="{ slugify(navMenuItem.label) }",
			href!="{ navMenuItem.slug ? '/' + navMenuItem.slug : '/#' }",
			on:click!="{ navItemClick }"
		)
			.text-center.p-3.text-3xl.text-white.font-normal(class="hover:text-maximumYellow")
				| { navMenuItem.label }
			+if('!navMenuItem.slug')
				.ml-3.w-5.h-5.pointer-events-none
					IconArrowRight
</template>
