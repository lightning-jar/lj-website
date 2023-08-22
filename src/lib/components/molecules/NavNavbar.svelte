<script lang="ts">
	// components
	import NavItemComponent from "$atoms/NavItem.svelte";
	import NavMenu from "$molecules/NavMenu.svelte";

	// types
	import type { NavItem } from "$types/types";

	// props
	export let nav: NavItem[] = [];

	// variables
	let item: NavItem;
</script>

<template lang="pug">
	svelte:options(immutable!="{ true }")
	nav#mainNav.hidden(
		class="lg:flex lg:gap-x-6 lg:pt-[.35rem] min-h-[3.75em] items-center xl:min-h-[3.5rem]"
	)
		+each('nav as item')
			+if('item?.menu')
				NavMenu(navItem!="{ item }")
				+else
					NavItemComponent(navItem!="{ item }")
</template>
