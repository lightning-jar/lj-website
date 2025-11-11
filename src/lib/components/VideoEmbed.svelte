<script lang="ts">
	// components
	import ButtonVideo from "$components/ButtonVideo.svelte";

	// props
	let { buttonText = "Watch Me", children, classes = "", imageClasses = "", youTube = "", thumbnailSrc = "", thumbnailAlt = "" } = $props();
</script>

<div class="relative { classes }">
		<!-- button -->
		<div class="absolute inset-0 flex justify-center items-center">
			<ButtonVideo youTube={ youTube }>{ buttonText }</ButtonVideo>
		</div>

		<!-- video thumbnail -->
		<img
			class="block w-full h-auto rounded-md overflow-hidden shadow-lg {imageClasses}"
			alt={ thumbnailAlt }
			height="1800"
			loading="lazy"
			src={ thumbnailSrc }
			width="3200"
		/>
		{@render children?.() }
</div>


