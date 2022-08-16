

<script lang="ts">

// import store
import { width } from "$stores/windowStore";

// import components
import NavLogoBlock from '$m/NavLogoBlock.svelte'
import HamburgerButton from '$a/ButtonHamburger.svelte';
import MainNavbar from '$m/NavNavbar.svelte';
import MobileMenu from '$m/NavMobileMenu.svelte';

// functions
import { slugify } from "$functions/helperFunctions";
import { inertElements, unInertElements } from '$functions/inertFunctions';

// svelte functions
import { onMount } from 'svelte';

// import types
import type { NavDataItem, NavMenuItem } from "$types/navTypes";

// settings
import { pageXPadding } from '$settings/paddingSettings';
import { navData } from '$settings/navSettings';

// variables
export let hamburger:HTMLButtonElement | null = null;
let mobileNav: HTMLDivElement | null = null;

// props
export let globalNav:HTMLHeadElement;
export let mainNav:HTMLDivElement | null = null;
export let section: string = '';
export let allMobileNavLinks: HTMLAnchorElement[] = [];
export let allMainNavLinks: HTMLAnchorElement[] = [];
export let windowWidth: number;

// on Mount
onMount(() => {
    allMobileNavLinks = Array.from(document.querySelectorAll('#mobileNav a'));
    allMainNavLinks = Array.from(document.querySelectorAll('#mainNav a, #mainNav button'));
    inertElements(allMobileNavLinks);
	});

//- Reactive Props
$: mobileMenuOpen = false;
$: { windowWidth = $width };

//- Reactive Expressions
//- Make main nav links inert (not focusable) when hidden
$: {
  if (windowWidth >= 768 && !mobileMenuOpen) { unInertElements(allMainNavLinks)}
  if (allMainNavLinks && windowWidth < 768 && !mobileMenuOpen) {inertElements(allMainNavLinks)}
}


// local functions
function closeMobileMenu() {
  const query = document.querySelector('#svelte');
  const svelteDiv: HTMLDivElement | null = (query instanceof HTMLDivElement) ? query : null;
  mobileMenuOpen = false;
  document.body.style.overflowY = 'scroll'
  document.documentElement.style.overflowY = 'scroll'
  if (svelteDiv) svelteDiv.style.overflowY = 'scroll';
  if (svelteDiv) svelteDiv.style.position = 'relative';
  inertElements(allMobileNavLinks);
}
function openMobileMenu() {
  const query = document.querySelector('#svelte');
  const svelteDiv: HTMLDivElement | null = (query instanceof HTMLDivElement) ? query : null;
  mobileMenuOpen = true;
  document.body.style.overflowY = 'hidden'
  document.documentElement.style.overflowY = 'hidden'
  if (svelteDiv) svelteDiv.style.overflowY = 'hidden';
  if (svelteDiv) svelteDiv.style.position = 'fixed';
  unInertElements(allMobileNavLinks);
}
function hamburgerClick(e:MouseEvent) {
  (mobileMenuOpen != true) ? openMobileMenu() : closeMobileMenu();
  }

</script>

<template lang="pug">

//- !!! fix nav background
header.relative.z-50.py-5(
  bind:this!="{globalNav}"
  )

  //- Desktop
  .mx-auto(class!="{pageXPadding}")
    .flex.justify-between.items-center.text-white(class="md:space-x-10 min-h-[3.75rem] xl:min-h-[3.5rem]")
      NavLogoBlock

      HamburgerButton(
        "{mobileMenuOpen}"
        bind:hamburger!="{hamburger}"
        on:hamburgerClick!="{hamburgerClick}"
        )

      MainNavbar(
        "{navData}"
        "{section}"
        bind:mainNav!="{mainNav}"
        )

  MobileMenu(
    "{hamburger}"
    "{navData}"
    "{mobileMenuOpen}"
    bind:mobileNav!="{mobileNav}"
    on:closeMobileMenu!="{hamburgerClick}"
    )

</template>