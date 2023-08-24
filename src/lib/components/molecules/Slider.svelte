<script lang="ts">
	//- svelte
	import { fade } from "svelte/transition";

	//- components
	import SliderButton from "$molecules/SliderButton.svelte";
	import IconArrowLeftAlt from "$atoms/IconArrowLeftAlt.svelte";

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
	.relative.grid.grid-cols-1.gap-y-10(class!="{ classes }")
		//- panels
		.grid.grid-cols-1.place-content-center.place-items-center
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
		.relative.grid.grid-cols-1(
			class=`
				sm:absolute
				sm:inset-0
				sm:place-content-end
				md:place-content-center
		`
		)
			//- buttons
			.flex.place-content-between.z-10
				+each('["left", "right"] as direction')
					+const('rotation = direction === "left" ? "" : "rotate-180"')
					button(
						class!=`
							cursor-pointer
							w-[1.5em]
							hover:text-maximumYellow
							sm:w-auto
							sm:rounded
							sm:px-2
							sm:py-2
							sm:bg-neutral-100/5
							sm:hover:bg-neutral-100/20
							sm:h-[3em]
							{ rotation }
							`,
						on:click!="{ previous }"
					): IconArrowLeftAlt(
						classes="w-[1.5em] h-[1.5em]"
					)

			//- counter
			.absolute.inset-0.flex.items-center.justify-center.gap-x-2(class="sm:hidden")
				+each('panels as panel, i')
					button.rounded-full.h-2.w-2.cursor-pointer(
						class!="{ currentPanel == i ? 'bg-maximumYellow' : 'bg-white/20' }",
						on:mousedown!="{()=> {currentPanel = i}}"
					)
</template>
