<script lang="ts">
	// components
	import PictureStack from "$atoms/PictureStack.svelte";

	// global functions
	import { deslugify } from "$functions/helperFunctions";

	// props
	export let slug: string = "";

	const noBreakpoint = [[""]];
	$: alt = deslugify(slug);
</script>

<template lang="pug">
	PictureStack(
		classes="block",
		alt!="{ alt }",
		breakpoints!="{ noBreakpoint }",
		fallback!="{slug}.png",
		folder="icons",
		height="48",
		slugCommon!="{ slug }",
		sourceFormats!="{ ['svg'] }",
		width="48"
	)
</template>
