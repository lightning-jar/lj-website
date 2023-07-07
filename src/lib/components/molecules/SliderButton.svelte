<script lang="ts">
	// components
	import IconArrowLeftAlt from "$atoms/IconArrowLeftAlt.svelte";

	// props
	export let direction: string = "left";
	const rounded =
		direction == "left"
			? "rounded-tr rounded-br translate-x-8 sm:translate-x-0"
			: "rounded-tl rounded-bl -translate-x-8 sm:translate-x-0";

	const buttonClasses = `${rounded} absolute text-white/80 hover:text-maximumYellow sm:bg-maximumYellow md:bg-opacity-100 h-16 w-16 justify-center items-center inset-y-[100%] sm:inset-y-1/2 -translate-y-8 ${direction}-0 flex transition-all sm:text-oxford sm:hover:bg-opacity-40`;
</script>

<template lang="pug">
	div({buttonClasses})
		.w-4.h-4(class!="{ direction == 'left' ? '' : 'rotate-180' }")
			IconArrowLeftAlt
</template>
