<script lang="ts">
	// props
	export let classes = "";
</script>

<template lang="pug">
	.relative(class!="{ classes }", class="lg:grid grid-cols-3")
		div
			slot(name="column-1")

		.flex.w-full.h-full.justify-center.items-center
			div(class="font-thin text-[50px] text-androidGreen") +

		div
			slot(name="column-2")
</template>
