<script lang="ts">
	// props
	export let classes = "";
	export let tag = "h2";

	const defaultClasses = [
		"text-4xl",
		"sm:text-[2.5rem]",
		"md:text-5xl",
		"xl:text-[3.25rem]",
		"font-serif",
		"font-bold",
		"",
	];

	const allClasses = `${defaultClasses.join(" ")}  ${classes}`;
</script>

<template lang="pug">
	svelte:element(class!="{ allClasses }", this!="{ tag }")
		slot
</template>
