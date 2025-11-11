<script lang="ts">
	let { classes = "text-oxford", fill = "currentColor" } = $props();
</script>

<div class="absolute top-0 left-0 right-0 w-full first-letter h-[12vw]">
	<svg
		class="w-full h-full { classes }"
		preserveAspectRatio="none"
		viewBox="0 0 500 500">
		<polygon
			fill={ fill }
			points="0,0 0,500 500,0" />
	</svg>
</div>
