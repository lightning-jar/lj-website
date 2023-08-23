<script lang="ts">
	// components
	import VideoEmbed from "$molecules/VideoEmbed.svelte";
	import SectionDark from "$molecules/SectionDark.svelte";
	import TransitionShapeBottom from "$molecules/TransitionShapeBottom.svelte";

	// variables
	const bauhaus = "2a45UBCIbJc";
	const svelteDocumentary = "kMlkCYL9qo0";
	const youTube = svelteDocumentary;
</script>

<template lang="pug">
	.relative.page-x-padding.bg-neutral-100.grid.grid-cols-1.place-items-center.place-content-center(
		class=`
			pt-4
			pb-16
			`
	)
		//- video player
		VideoEmbed(
			classes=`
				border-primary
				border-t
				flex
				justify-center
				lg:border-none
				lg:max-w-[70vw]
				mb-6
				relative
				w-full`,
			youTube!="{ youTube }"
		)
			img(
				slot="thumbnail",
				src="https://res.cloudinary.com/dn0pqjjbq/image/upload/e_auto_contrast,f_auto,q_59/v1692798395/svelte-thumb_cziiar.avif"
			)
		//- video player caption
		.text-oxford.text-center
			.italic.mb-2(class="xl:text-18") What we're watching this week:
			.italic.font-medium.text-18(class="xl:text-22") "Svelte Origins: A Javascript Documentary"
</template>
