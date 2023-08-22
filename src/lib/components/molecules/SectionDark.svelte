<script lang="ts">
	// settings
	import { pageXPadding } from "$settings/layoutSettings";

	// props
	export let classes = "bg-transparent";
	export let id: string | null = null;
</script>

<template lang="pug">
	section.text-white.relative(class!="{ pageXPadding + ' ' + classes }", {id})
		slot
</template>
