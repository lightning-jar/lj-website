<script lang="ts">
	//- svelte
	import { fade } from "svelte/transition";

	//- components
	import SliderButton from "$molecules/SliderButton.svelte";

	//- data
	export let panels;

	//-props
	export let classes = "";

	$: currentPanel = 0;

	const fadeOptions = { delay: 100, duration: 500 };

	function next() {
		if (panels.length > currentPanel + 1) currentPanel = currentPanel + 1;
		else currentPanel = 0;
	}

	function previous() {
		if (currentPanel > 0) currentPanel = currentPanel - 1;
		else currentPanel = panels.length - 1;
	}

	let i: number;
</script>

<template lang="pug">
	.relative.w-full.mb-24.overflow-visible
		//- content container
		.flex.justify-center.items-center.w-100.px-4(class!="{ 'md:px-24' + classes }")
			.relative.w-full.flex.justify-center.items-center.select-none &nbsp;
				+each('panels as panel, index')
					+if('currentPanel == index')
						div(
							draggable="true",
							in:fade!="{ fadeOptions }",
							on:dragstart!="{()=> {currentPanel = (currentPanel < panels.length - 1) ? currentPanel + 1 : 0}}",
							on:touchstart!="{()=> {currentPanel = (currentPanel < panels.length - 1) ? currentPanel + 1 : 0}}"
						)
							slot(
								name="panel",
								panel!="{ panel }"
							)

		//- buttons
		div(on:click!="{ previous }")
			SliderButton(direction!="{ 'left' }")
		div(on:click!="{ next }")
			SliderButton(direction!="{ 'right' }")

		//- counter
		.justify-center.flex(class="sm:hidden")
			+each('panels as panel, i')
				button.px-1.mt-24(class="cursor-pointer", on:mousedown!="{()=> {currentPanel = i}}")
					.rounded-full.h-2.w-2.pointer-events-none(
						class!="{ currentPanel == i ? 'bg-maximumYellow' : 'bg-white/20' }"
					)
</template>
