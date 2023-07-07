<script lang="ts">
	// svelte functions
	import { createEventDispatcher } from "svelte";

	// props
	export let mobileMenuOpen: boolean | null = null;
	export let hamburger: HTMLButtonElement;

	// variables
	const dispatch = createEventDispatcher();

	// change selected value
	function hamburgerClick() {
		dispatch("hamburgerClick", {}, {});
	}
</script>

<template lang="pug">
	.flex.items-center(class="lg:hidden")
		button#hamburger.group.bg-transparent.rounded-md.my-1.p-2.inline-flex.items-center.justify-center.text-neutral-100(
			class="hover:text-white bg-transparent focus:bg-white !outline-none focus:bg-opacity-0 hover:bg-white hover:bg-opacity-5",
			active!="{ mobileMenuOpen }",
			aria-expanded!="{ mobileMenuOpen == true ? true : false }",
			bind:this!="{ hamburger }",
			on:click!="{ hamburgerClick }",
			type="button"
		)
			span.sr-only Open menu
			.pointer-events-none
				.border-b.border-white.w-8.h-0.transition-transform.origin-center.mb-2(
					class!=["{(mobileMenuOpen) ? 'rotate-45 translate-y-1' : ''}","group-focus:border-maximumYellow group-hover:border-maximumYellow"]
				)
				.border-b.border-white.w-8.h-0.transition-transform.origin-center(
					class!=["{(mobileMenuOpen) ? '-rotate-45 -translate-y-1' : ''}","group-focus:border-maximumYellow group-hover:border-maximumYellow"]
				)
</template>
