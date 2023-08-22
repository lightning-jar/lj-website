<script lang="ts">
	// components
	import VideoEmbed from "$molecules/VideoEmbed.svelte";
	import SectionDark from "$molecules/SectionDark.svelte";
	import TransitionShapeBottom from "$molecules/TransitionShapeBottom.svelte";

	// variables
	const bauhaus = "2a45UBCIbJc";
	const youTube = "Y69wOKg6yp4";
</script>

<template lang="pug">
	.relative.page-x-padding.bg-neutral-100(classes="pt-0 -z-10")
		//- video player
		.relative.z-20.flex.justify-center.text-white
			div(class="lg:max-w-[70vw]")
				VideoEmbed(youTube!="{ youTube }")
				.italic.mt-3 What we're watching this week:
				.italic "100 Years of Bauhaus | Walter Gropius - BBC Documentary"

		//- transition shape
		.mb-24
			TransitionShapeBottom
</template>
