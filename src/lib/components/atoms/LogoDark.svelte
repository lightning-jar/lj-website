<script lang="ts">
	// props
	export let loading: string | null = "lazy";
	export let preload: string[] = [];

	// components
	import PictureStack from "$atoms/PictureStack.svelte";

	// variables
	const image = {
		alt: "Lightning Jar logo",
		breakpoints: [[""]],
		classes: "block",
		fallback: "lightning-jar-logo.png",
		folder: "images",
		height: "64",
		loading: loading,
		slugCommon: "lightning-jar-logo",
		sourceFormats: ["svg", "webp"],
		preload: preload,
		width: "432",
	};
</script>

<template lang="pug">
	PictureStack(
		classes!="{ image.classes }",
		alt!="{ image.alt }",
		breakpoints!="{ image.breakpoints }",
		fallback!="{ image.fallback }",
		folder!="{ image.folder }",
		height!="{ image.height }",
		loading!="{ image.loading }",
		preload!="{ image.preload }",
		slugCommon!="{ image.slugCommon }",
		sourceFormats!="{ image.sourceFormats }",
		width!="{ image.width }"
	)
</template>
