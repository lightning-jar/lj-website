<script lang="ts">
	// stores
	import { page } from "$app/state";

	// type
	interface OGImage {
		src: string;
		alt: string;
		width: string;
		height: string;
	}
	interface Props {
		type: string;
		url: string;
		title: string;
		description: string;
		images: OGImage[];
	}

	// props
	let {
			type = "website",
			url = "",
			title = "Lightning Jar",
			description = "The world is more digital and mobile every day.",
			images = [
				{
					src: "https://lightningjar.com/images/lightning-jar-og.jpg",
					alt: "Lightning Jar logo",
					width: "800",
					height: "600",
				},
			]
		}: Props = $props();

	function ogData() {
		const data = [
			["og:type", type],
			["og:url", url ? url : page?.url?.href ?? null],
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

<svelte:head>
	{#each ogData() as datum}
		<meta
			content={ datum[1] }
			property={ datum[0] }
		/>
	{/each}
</svelte:head>

