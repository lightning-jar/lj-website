<script lang="ts">
// props
let {
	classes = "",
	host = "peertube",
	src = "https://peertube.tv/videos/embed/0f5601f5-520c-427d-9a27-f90ee30a2d87",
} = $props();
</script>

<button popovertarget="mediaPlayer" title="Close" class="absolute top-4 right-8 text-24px">✕</button>

{#if host === "peertube"}
	<iframe
		allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share;"
		allowfullscreen={true}
		class="w-full h-auto aspect-video rounded {classes}"
		frameborder="0"
		height="315"
		loading="lazy"
		referrerpolicy="strict-origin-when-cross-origin"
		sandbox="allow-same-origin allow-scripts allow-popups"
		src={ src }
		title="peertube video player"
		width="560"
	></iframe>
{/if}



