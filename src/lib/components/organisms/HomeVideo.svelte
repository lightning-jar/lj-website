<script lang="ts">
	// components
	import VideoEmbed from "$components/VideoEmbed.svelte";

	// variables
	const bauhaus = "2a45UBCIbJc";
	const svelteDocumentary = "kMlkCYL9qo0";
	const youTube = svelteDocumentary;
	const thumbnailSrc = "https://res.cloudinary.com/dn0pqjjbq/image/upload/e_auto_contrast,f_auto,q_59/v1692798395/svelte-thumb_cziiar.avif";

	let { children } = $props();
</script>

<div class="relative page-x-padding bg-neutral-100 grid grid-cols-1 place-items-center place-content-center pt-4 pb-16">
	<!--video player -->
	<VideoEmbed
		classes="
			border-primary
			border-t
			flex
			justify-center
			lg:border-none
			lg:max-w-[70vw]
			mb-6
			relative
			w-full"
		{ thumbnailSrc }
		thumbnailAlt="Svelte Origins: A Javascript Documentary"
		youTube={ youTube }
	>
		<!-- video player caption -->
		<div class="text-oxford text-center">
			<div class="italic mb-2 xl:text-18">What we're watching this week:</div>
			<div class="italic font-medium text-18 xl:text-22">"Svelte Origins: A Javascript Documentary"</div>
		</div>
	</VideoEmbed>
	</div>

