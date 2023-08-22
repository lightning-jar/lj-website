<script lang="ts">
	// components
	import IconArrowRight from "$atoms/IconArrowRight.svelte";
	import MobileMenuBack from "$molecules/MobileMenuBack.svelte";
	import MobileMenuItem from "$molecules/MobileMenuItem.svelte";

	// stores
	import { mobileNavOpen, activeMobileMenu } from "$stores/navStore";

	// types
	import type { NavItem } from "$types/types";

	// refs
	let mobileNav: HTMLElement;

	// props
	export let nav: NavItem[];
</script>

<template lang="pug">
	#mobileNav.group.w-full.h-full(class="md:hidden", open!="{ $mobileNavOpen }")
		//- inner
		.h-full.w-full.pt-12.pb-6.relative(class="group-open:pointer-events-auto")
			//- main menu
			nav.absolute.inset-0(
				class!="{ $activeMobileMenu.toLowerCase() == 'main' ? 'block pointer-events-auto' : 'hidden pointer-events-none' }",
				data-mobile-menu!="{ 'main' }"
			)
				+each('nav as navItem')
					MobileMenuItem(navItem!="{ navItem }")

			//- sub menus
			+each('nav as topLevelItem, index')
				+if('topLevelItem?.menu')
					nav.absolute.inset-0(
						class!="{ $activeMobileMenu.toLowerCase() == topLevelItem?.label.toLowerCase() ? 'block pointer-events-auto' : 'hidden pointer-events-none' }",
						data-mobile-menu!="{ topLevelItem?.label.toLowerCase() }"
					)
						//- back button
						MobileMenuBack

						//- menu items
						+each('topLevelItem?.menu as navItem')
							MobileMenuItem(navItem!="{ navItem }")
</template>
