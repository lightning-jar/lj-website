<script lang="ts">
	// settings

	// props
	export let classes = "bg-transparent";
	export let id: string | null = null;
</script>

<template lang="pug">
	section.text-white.relative.page-x-padding(class!="{ classes }", {id})
		slot
</template>
