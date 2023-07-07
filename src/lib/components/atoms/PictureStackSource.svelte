<script lang="ts">
	// props
	export let type = "";
	export let srcset = "";
	export let media = "";

	// constants
	const format = type.replace("image/", "").replace("+xml", "");
</script>

<template lang="pug">
	source(
		{media},
		{srcset},
		{type}
	)
</template>
