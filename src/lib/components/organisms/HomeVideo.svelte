<script lang="ts">
	// components
	import VideoEmbed from "$molecules/VideoEmbed.svelte";
	import SectionDark from "$molecules/SectionDark.svelte";
	import TransitionShapeBottom from "$molecules/TransitionShapeBottom.svelte";

	// variables
	const bauhaus = "2a45UBCIbJc";
	const youTube = bauhaus;
</script>

<template lang="pug">
	SectionDark(classes!="{ '-translate-y-24 !pt-0 -mt-4 -z-10' }")
		//- video player
		.relative.z-20.flex.justify-center.text-white.translate-y-24
			div(class="lg:max-w-[70vw]")
				VideoEmbed({youTube})
				.italic.mt-3 What we're watching this week:
				.italic "100 Years of Bauhaus | Walter Gropius - BBC Documentary"

		//- transition shape
		.mb-24
			TransitionShapeBottom
</template>
