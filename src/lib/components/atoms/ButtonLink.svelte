<script lang="ts">
	// props
	export let href = "";
	export let label = "";
</script>

<template lang="pug">
	a.inline-block.shadow-md.px-8.py-4.text-xl.mt-8(
		class="bg-[#EAF92E] transition-shadow hover:shadow-xl",
		href!="{ href }",
		tile="Send a message"
	)
		span { label }
		slot
</template>
