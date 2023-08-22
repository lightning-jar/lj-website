<script lang="ts">
	// settings
	import { pageXPadding } from "$settings/layoutSettings";

	// props
	export let classes = "";
</script>

<template lang="pug">
	section.bg-white.text-OxfordBlue.relative(class!="{ pageXPadding + ' ' + classes }")
		slot
</template>
