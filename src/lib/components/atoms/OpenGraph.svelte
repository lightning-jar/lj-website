<script lang="ts">
	// stores
	import { page } from "$app/stores";

	// props
	export let type = "website";
	export let url = "";
	export let title = "Lightning Jar";
	export let description = "The world is more digital and mobile every day.";
	export let images: OGImage[] = [
		{
			src: "https://lightningjar.com/images/lightning-jar-og.jpg",
			alt: "Lightning Jar logo",
			width: "800",
			height: "600",
		},
	];

	// local types
	interface OGImage {
		src: string;
		alt: string;
		width: string;
		height: string;
	}

	import { onMount } from "svelte";

	function ogData() {
		const data = [
			["og:type", type],
			["og:url", url ? url : $page.url.href],
			["og:title", title],
			["og:description", description],
		];

		// add images
		images.forEach((image) => {
			data.push(["og:image", image.src]);
			data.push(["og:image:alt", image.alt]);
			data.push(["og:image:width", image.width]);
			data.push(["og:image:height", image.height]);
		});

		return data;
	}
</script>

<template lang="pug">
	svelte:head
		+each('ogData() as datum')
			meta(
				content!="{ datum[1] }",
				property!="{ datum[0] }"
			)
</template>
