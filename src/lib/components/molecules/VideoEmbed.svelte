<script lang="ts">
	// components
	import ButtonVideo from "$atoms/ButtonVideo.svelte";

	// props
	export let buttonText = "Watch Me";
	export let classes = "";
	export let imageClasses = "";
	export let youTube = "";
	export let thumbnailSrc = "";
</script>

<template lang="pug">
	.relative(class!="{ classes }")
		//- button
		.absolute.inset-0.flex.justify-center.items-center
			ButtonVideo(youTube!="{ youTube }") { buttonText }

		//- video thumbnail
		img(
			class="block w-full h-auto rounded-md overflow-hidden shadow-lg {imageClasses}",
			alt="video thumbnail",
			height="1800",
			loading="lazy",
			src!="{ thumbnailSrc }",
			width="3200"
		)
</template>
