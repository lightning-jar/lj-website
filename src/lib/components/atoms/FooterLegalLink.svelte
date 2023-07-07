<script lang="ts">
	// props
	export let classes = "";
	export let href = "";
</script>

<template lang="pug">
	a.font-sans.inline-block.text-xs.opacity-80(
		class="hover:text-maximumYellow underline underline-offset-4 decoration-slate-500",
		class!="{ classes ? ' ' + classes : '' }",
		{href}
	)
		slot
</template>
