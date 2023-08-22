<script lang="ts">
	// components
	import IconArrowRight from "$atoms/IconArrowRight.svelte";

	// stores
	import { activeMobileMenu, mobileNavOpen } from "$stores/navStore";

	// types
	import type { NavItem } from "$types/types";

	// props
	export let target = "Main";

	// refs
	let button: HTMLButtonElement;

	function handleMousedown() {
		$activeMobileMenu = target;
	}
</script>

<template lang="pug">
	.flex.justify-center.items-center.mb-0
		button.flex.items-center.justify-center.cursor-pointer(
			class="border-b border-transparent focus:border-slate-600 !outline-none",
			bind:this!="{ button }",
			on:mousedown|stopPropagation!="{ handleMousedown }"
		)
			.ml-3.w-5.h-5.rotate-180.fill-current.pointer-events-none
				IconArrowRight
			.text-center.p-3.text-3xl.text-current.pointer-events-none Back
</template>
