<script lang="ts">
	// components
	import PictureStack from "$atoms/PictureStack.svelte";

	// props
	export let href = "https://www.pimcore.com";

	// variables
	const image = {
		alt: "Lightning Jar logo",
		breakpoints: [[""]],
		classes: "block",
		fallback: "pimcore-gold-partner.png",
		folder: "images",
		height: "120",
		loading: "lazy",
		slugCommon: "pimcore-gold-partner",
		sourceFormats: ["svg"],
		preload: [],
		width: "100",
	};
</script>

<template lang="pug">
	a.block.mb-8.select-none(
		class="mix-blend-luminosity hover:mix-blend-normal",
		aria-label="Pimcore Gold Partner",
		draggable="false",
		href!="{ href }",
		title="we love pimcore"
	)
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
