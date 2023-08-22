<script lang="ts">
	// context api
	import { getContext } from "svelte";

	// types
	import type { Writable } from "svelte/store";
	type BrandLinkStore = Writable<HTMLAnchorElement | null>;

	// stores
	import { mobileNavOpen, activeMobileMenu } from "$stores/navStore";

	//get the brand link store from context api
	const brandLinkStore = getContext("brandLinkStore") as BrandLinkStore;

	// functions
	function getFirstItemInActiveMobileMenu():
		| HTMLAnchorElement
		| HTMLButtonElement {
		// get the active mobile menu i
		const menu = document.querySelector(
			`[data-mobile-menu="${$activeMobileMenu}"]`,
		);
		const container = menu?.firstElementChild as HTMLDivElement;
		const activeMobileMenuFirstItem = container?.firstElementChild as
			| HTMLAnchorElement
			| HTMLButtonElement;

		// return the first item in the active mobile menu
		return activeMobileMenuFirstItem;
	}
	function toggleMobileMenu() {
		// if closed, open the menu, and put focus on the first menu item
		if (!$mobileNavOpen) {
			// open the menu
			$mobileNavOpen = true;
			// stop page from scrolling
			// disableScroll();
			// focus first mobile menu item
			// focusFirstMobileMenuItem();
		} else {
			// close the menu
			$mobileNavOpen = false;
			// allow page to scroll
			// enableScroll();
			// reset active mobile menu
			$activeMobileMenu = "Main";
		}
	}
	function handleKeydown(event: KeyboardEvent) {
		// if the menu is open
		if ($mobileNavOpen) {
			// if the escape key is pressed
			if (event.key === "Escape") {
				// close the menu
				toggleMobileMenu();
			}

			// ** click trapping **

			// if the tab key is pressed with shift
			// focus on the brand link
			else if (event.key === "Tab" && event.shiftKey) {
				event.preventDefault();
				const brandLink = $brandLinkStore;
				brandLink?.focus();
			}

			// focus on first mobile menu item in the active menu
			else if (event.key === "Tab") {
				event.preventDefault();
				const firstItem = getFirstItemInActiveMobileMenu();
				firstItem?.focus();
			}
		}
	}
	const btnBaseClasses = `appearance-none inline-flex items-center justify-center rounded-md my-1 p-2`;
	const btnFocusClasses = `focus:bg-primary`;
	const btnFocusVisibleClasses = `focus-visible:outline focus-visible:outline-4 focus-visible:outline-accent focus-visible:outline-2 focus-visible:outline-neutral-100`;
	const btnHoverClasses = `hover:bg-primary`;
</script>

<template lang="pug">
	.flex.items-center.text-neutral-100(class="md:hidden")
		button.group(
			class!="{btnBaseClasses} {btnFocusClasses} {btnFocusVisibleClasses} {btnHoverClasses}",
			active!="{ $mobileNavOpen }",
			aria-expanded!="{ $mobileNavOpen == true ? true : false }",
			on:click!="{ toggleMobileMenu }",
			on:keydown!="{ handleKeydown }"
		)
			span.sr-only Open menu
			.pointer-events-none.select-none.py-1
				.border-b.border-white.w-8.h-0.transition-transform.origin-center.mb-2(
					class!=["{($mobileNavOpen) ? 'rotate-45 translate-y-1' : ''}","group-hover:border-neutral-50"]
				)
				.border-b.border-white.w-8.h-0.transition-transform.origin-center(
					class!=["{($mobileNavOpen) ? '-rotate-45 -translate-y-1' : ''}","group-hover:border-neutral-50"]
				)
</template>
