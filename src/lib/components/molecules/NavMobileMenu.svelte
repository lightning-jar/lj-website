<script lang="ts">
	// components
	import NavItem from "$atoms/NavItem.svelte";
	import IconArrowRight from "$atoms/IconArrowRight.svelte";
	import MobileMenuPrimary from "$molecules/NavMobilePrimary.svelte";
	import MobileMenuFlyout from "$molecules/NavMobileFlyout.svelte";

	// types
	import type { NavDataItem, Flyout } from "$types/navTypes";

	// svelte functions
	import { onMount, createEventDispatcher } from "svelte";

	// import helper functions
	import { slugify } from "$functions/helperFunctions";
	import { inertElements, unInertElements } from "$functions/inertFunctions";

	// props
	export let mobileMenuOpen: boolean | null;
	export let navData: NavDataItem[];
	export let hamburger: HTMLElement;
	export let mobileNav: HTMLElement;
	export let primaryMobileNav: HTMLElement;

	// variables
	const dispatch = createEventDispatcher();
	let flyouts: Record<string, Flyout>;
	$: flyouts = {}; // object to hold flyouts refs using bind:this

	// reactive refs
	let activeMenu: HTMLElement | null = null;
	let openFlyoutActual: HTMLElement | null;
	$: openFlyoutActual = null;

	// reactive expressions
	// update activeMenu
	$: {
		if (mobileMenuOpen == true) {
			activeMenu = openFlyoutActual ? openFlyoutActual : primaryMobileNav;
		} else {
			activeMenu = null;
			closeAnyOpenFlyout();
		}
	}

	// local functions
	function onKeyDown(e: KeyboardEvent) {
		// trap focus when mobile menu is open
		if (mobileMenuOpen) {
			// variables & refs
			const activeEl: HTMLElement | null =
				document.activeElement instanceof HTMLElement
					? document.activeElement
					: null;
			const otherKeys: boolean = e.ctrlKey || e.altKey || e.metaKey;
			let array: HTMLElement[] = activeMenu
				? Array.from(activeMenu.querySelectorAll("a"))
				: [];
			const firstItem: HTMLElement | null = array[0] ? array[0] : null;
			const lastItem: HTMLElement | null =
				array.length > 0 ? array[array.length - 1] : null;
			const previousItem: HTMLElement | null =
				activeEl && array.indexOf(activeEl) && array.indexOf(activeEl) - 1
					? array[array.indexOf(activeEl) - 1]
					: null;
			const nextItem: HTMLElement | null =
				activeEl && array.indexOf(activeEl) && array.indexOf(activeEl) + 1
					? array[array.indexOf(activeEl) + 1]
					: null;

			// action functions
			const escape = () => {
				!openFlyoutActual ? closeMobileMenu() : closeFlyout(openFlyoutActual);
			};
			const focusNext = () => {
				activeEl == firstItem ? hamburger.focus() : null;
				activeEl == hamburger && lastItem ? lastItem.focus() : null;
				activeEl != firstItem && activeEl != hamburger && previousItem
					? previousItem.focus()
					: null;
			};
			const focusPrevious = () => {
				activeEl == lastItem ? hamburger.focus() : null;
				activeEl == hamburger && firstItem ? firstItem.focus() : null;
				activeEl != lastItem && activeEl != hamburger && nextItem
					? nextItem.focus()
					: null;
			};
			const selectItem = () => {
				if (activeEl) activeEl.click();
			};

			// key logic
			[
				"Tab",
				"ArrowUp",
				"ArrowDown",
				"ArrowLeft",
				"ArrowRight",
				"Escape",
			].includes(e.key)
				? e.preventDefault()
				: null;

			// mobile menu is open
			((e.key == "Tab" && e.shiftKey) || e.key == "ArrowUp") && !otherKeys
				? focusNext()
				: null;
			(e.key == "Tab" || e.key == "ArrowDown") && !e.shiftKey && !otherKeys
				? focusPrevious()
				: null;
			(e.key == "Escape" || e.key == "ArrowLeft") && !e.shiftKey && !otherKeys
				? escape()
				: null;
			e.key == "ArrowRight" && !e.shiftKey && !otherKeys ? selectItem() : null;
		}
	}
	function closeMobileMenu() {
		dispatch("closeMobileMenu", {}, {});
	}
	function openFlyout(flyout: Flyout) {
		primaryMobileNav.style.opacity = "0";
		openFlyoutActual = flyout;
		flyout.setAttribute("open", "");
		const back = flyout.querySelector('[data-role="back"]');
		const confirmedBack: HTMLElement | null =
			back instanceof HTMLElement ? back : null;
		if (confirmedBack) confirmedBack.focus();
	}
	function closeFlyout(flyout: Flyout) {
		primaryMobileNav.style.opacity = "unset";
		openFlyoutActual = null;
		const firstLink = primaryMobileNav.querySelector("a");
		if (firstLink) firstLink.focus();
		flyout.removeAttribute("open");
	}
	function closeAnyOpenFlyout() {
		const keys = Object.keys(flyouts);
		keys.forEach((key) => {
			const flyout: Flyout = flyouts[key];
			if (flyout.hasAttribute("open")) {
				closeFlyout(flyout);
			}
		});
	}
	function closeThisFlyout(e: CustomEvent) {
		const data = e.detail;
		const handle = slugify(data.label);
		const flyout = flyouts[handle];
		closeFlyout(flyout);
	}
	function navItemClick(e: CustomEvent) {
		e.stopPropagation();
		const data = e.detail;
		const handle: string = slugify(data.label);
		if (flyouts[handle]) {
			e.preventDefault();
			openFlyout(flyouts[handle]);
		} else {
			closeMobileMenu();
		}
	}
</script>

<svelte:body on:keydown="{onKeyDown}" />

<template lang="pug">
	#mobileNav.group.fixed.inset-0.p-0.pt-24.transition.transform.origin-top-right.opacity-0.transition-opacity.pointer-events-none.h-screen(
		class="open:opacity-100 md:hidden",
		bind:this!="{ mobileNav }",
		open!="{ mobileMenuOpen ? true : null }"
	)
		//- inner
		.h-full.bg-oxfordBlue.w-full.pt-12.pb-6.relative(
			class="group-open:pointer-events-auto"
		)
			MobileMenuPrimary(
				bind:primaryMobileNav!="{ primaryMobileNav }",
				navData!="{ navData }",
				on:navItemClick!="{ navItemClick }"
			)

			//- flyouts
			+each('navData as flyout')
				MobileMenuFlyout(
					on:closeFlyout!="{ closeThisFlyout }",
					{flyouts},
					{flyout}
				)
</template>
