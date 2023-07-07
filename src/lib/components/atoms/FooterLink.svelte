<script lang="ts">
	// props
	export let classes = "";
	export let href = "";
</script>

<template lang="pug">
	a.font-sans.opacity-80(
		class="hover:text-maximumYellow hover:opacity-100 transition-all underline underline-offset-4 decoration-slate-500",
		class!="{ classes ? ' ' + classes : '' }",
		href!="{ href }"
	)
		slot
</template>
