<script lang="ts">
	// components
	import PictureStack from "$atoms/PictureStack.svelte";
	import ButtonVideo from "$atoms/ButtonVideo.svelte";

	// settings
	const imagesFolder = "images";

	// props
	export let youTube = "";

	// variables
	const videoThumbnail = {
		alt: "Bauhaus Documentary - Thumbnail",
		breakpoints: [
			// unique slug, [rule 1], [rule 2]
			["-388", ["max-width", "420.99px"], ["orientation", "portrait"]],
			["-486", ["max-width", "575.99px"]],
			["-658", ["max-width", "767.99px"]],
			["-928", ["max-width", "991.99px"]],
			["-1200", ["max-width", "1199.99px"]],
			["-1400", ["min-width", "1400px"]],
		],
		classes: "block rounded-lg",
		height: "675",
		width: "1200",
		fallback: "video-thumb-bahaus-1200.jpg",
		slugCommon: "video-thumb-bahaus",
	};
</script>

<template lang="pug">
	.relative.w-full
		//- button
		.absolute.inset-0.flex.justify-center.items-center
			ButtonVideo(youTube!="{ youTube }") Watch Me

		//- video thumbnail
		PictureStack(
			classes!="{ videoThumbnail.classes }",
			alt!="{ videoThumbnail.alt }",
			breakpoints!="{ videoThumbnail.breakpoints }",
			fallback!="{ videoThumbnail.fallback }",
			folder!="{ imagesFolder }",
			height!="{ videoThumbnail.height }",
			slugCommon!="{ videoThumbnail.slugCommon }",
			width!="{ videoThumbnail.width }"
		)
</template>
