<script lang="ts">
	// components
	import IconArrowLeftAlt from "$atoms/IconArrowLeftAlt.svelte";

	// props
	export let direction = "left";
	const rounded = direction == "left" ? "rounded" : "rounded";

	const buttonClasses = `
	bg-blue-500/10
	rounded
	//absolute
	text-white/80
	hover:text-maximumYellow
	sm:bg-maximumYellow
	md:bg-opacity-100
	h-[3.5em]
	w-[3.5em]
	justify-center
	items-center
	inset-y-[100%]
	sm:inset-y-1/2
	-translate-y-8
	${direction}-0
	flex
	transition-all
	sm:text-oxford
	sm:hover:bg-opacity-40`;
</script>

<template lang="pug">
	div(class!="{ buttonClasses }")
		.w-4.h-4(class!="{ direction == 'left' ? '' : 'rotate-180' }")
			IconArrowLeftAlt
</template>
