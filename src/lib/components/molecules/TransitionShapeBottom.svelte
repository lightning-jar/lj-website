<script lang="ts">
	export let classes = "fill-oxfordBlue";
</script>

<template lang="pug">
	.absolute.left-0.right-0.w-full.first-letter(class="h-[12vw] -bottom-[1px]")
		svg(
			class="w-full h-full",
			preserveAspectRatio="none",
			viewBox="0 0 500 500"
		)
			polygon(class!="{ classes }", points="0,0 0,500 500,500")
</template>
