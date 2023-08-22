<script lang="ts">
	// props
	export let classes = "";
</script>

<template lang="pug">
	section.bg-white.text-OxfordBlue.relative.page-x-padding(class!="{ classes }")
		slot
</template>
