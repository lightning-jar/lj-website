<script lang="ts">
	// components
	import IconArrowRight from "$atoms/IconArrowRight.svelte";

	// stores
	import { activeMobileMenu, mobileNavOpen } from "$stores/navStore";

	// types
	import type { NavItem } from "$types/types";

	// props
	export let navItem: NavItem;

	// refs
	let a: HTMLAnchorElement | HTMLButtonElement;

	// variables
	let tag: string;
	$: tag = navItem.href ? "a" : "button";

	function handleMousedown() {
		if (a instanceof HTMLAnchorElement && a.href) {
			$mobileNavOpen = false;
			a.click();
		} else if (navItem.menu && navItem.menu[0] && navItem.label) {
			$activeMobileMenu = navItem.label;
		}
	}
</script>

<template lang="pug">
	svelte:element.flex.justify-center.items-center.w-full(
		class="focus:border-slate-600",
		bind:this!="{ a }",
		href!="{ navItem.href ? navItem.href : null }",
		on:mousedown|preventDefault|stopPropagation!="{ handleMousedown }",
		rel!="{ navItem.rel ? navItem.rel : null }",
		role!="{ tag === 'a' ? 'link' : 'button' }",
		this!="{ tag }",
		title!="{ navItem.label }"
	)
		.text-center.p-3.text-3xl.pointer-events-none { navItem.label }
		+if('!navItem.menu')
			.ml-3.w-5.h-5.pointer-events-none
				IconArrowRight
</template>
