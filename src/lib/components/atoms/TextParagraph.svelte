<script lang="ts">
	// props
	export let classes = "";
</script>

<template lang="pug">
	p.opacity-95(class="xl:text-xl 2xl:text-2xl !leading-none", Class!="{ classes }")
		slot
</template>
