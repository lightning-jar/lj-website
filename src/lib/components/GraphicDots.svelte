<script lang="ts">
	let {children, classes = ""} = $props();
</script>

<div class="pointer-events-none" aria-hidden="true">
	<!-- use css radial gradient to create dots -->
	<div
		id="dot-grid"
		class="absolute text-maximumYellow bottom-0 right-0 w-2/5 aspect-square {classes}"
		aria-hidden="true"
		style="background-image: radial-gradient(currentColor 20%, transparent 20%); background-position: 0 0, 50%; background-size: 10% 10%"
	>
		<!--polyfill for aspect ratio -->
		<div class="h-0 w-full pt-[100%]"></div>
	</div>
</div>
