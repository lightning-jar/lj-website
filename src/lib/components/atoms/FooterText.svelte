<script lang="ts">
	// props
	export let classes = "";
</script>

<template lang="pug">
	.font-sans.opacity-80(class!="{ classes ? ' ' + classes : '' }")
		slot
</template>
