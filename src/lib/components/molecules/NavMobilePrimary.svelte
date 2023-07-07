<script lang="ts">
	// components
	import MobileMenuItem from "$atoms/NavMobileItem.svelte";

	// types
	import type { NavDataItem } from "$types/navTypes";

	// props
	export let navData: NavDataItem[];
	export let primaryMobileNav: HTMLElement;

	// variables
	//const dispatch = createEventDispatcher();

	//const setPrimaryMobileNav = () => {
	//    dispatch('setPrimaryMobileNav', primaryMobileNav, {});
	//  }

	//onMount(() => {
	//  setPrimaryMobileNav();
	//});
</script>

<template lang="pug">
	nav.absolute.w-full.transition-transform(
		bind:this!="{ primaryMobileNav }",
		id="primaryMobileNav"
	)
		+each('navData as navMenuItem')
			MobileMenuItem(
				navMenuItem!="{ navMenuItem }",
				on:navItemClick
			)
</template>
