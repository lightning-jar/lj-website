<script lang="ts">
	export let classes = "";
</script>

<template lang="pug">
	//- use css radial gradient to create dots
	#dot-grid(
		class="absolute text-maximumYellow bottom-0 right-0 w-2/5 h-1/3",
		style="background-image: radial-gradient(currentColor 20%, transparent 20%); background-position: 0 0, 50%; background-size: 10% 10%"
	)
</template>
