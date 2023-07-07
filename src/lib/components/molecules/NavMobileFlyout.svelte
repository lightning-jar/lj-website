<script lang="ts">
	// components
	import IconArrowRight from "$atoms/IconArrowRight.svelte";
	import MobileMenuBack from "$atoms/NavMobileBack.svelte";
	import MobileMenuFlyoutItem from "$atoms/NavMobileFlyoutItem.svelte";

	// types
	import type { NavDataItem } from "$types/navTypes";

	// imported functions
	import { slugify } from "$functions/helperFunctions";

	// svelte functions
	import { createEventDispatcher } from "svelte";

	// props
	export let flyout: NavDataItem;
	export let flyouts: NavDataItem[];

	// variables
	const dispatch = createEventDispatcher();
</script>

<template lang="pug">
	+if('!flyout.slug')
		nav.absolute.w-full.transition-transform(
			class="translate-x-full open:translate-x-0",
			bind:this!="{ flyouts[slugify(flyout.label)] }",
			id!="{ slugify(flyout.label) + '-mobile-flyout' }"
		)
			MobileMenuBack(
				on:closeFlyout,
				{flyout}
			)

			+each('flyout.items as item')
				MobileMenuFlyoutItem({item})
</template>
