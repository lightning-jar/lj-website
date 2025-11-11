<script lang="ts">
	// svelte
	import { fade } from "svelte/transition";

	// components
	import IconArrowLeftAlt from "$components/IconArrowLeftAlt.svelte";
	import SliderButton from "$components/SliderButton.svelte";


	//- data
	let { children, panels, classes = "" } = $props();

	let currentPanel = $state(0);

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


<div class="relative grid grid-cols-1 gap-y-10 { classes }">
	<!-- panels -->
	<div class="grid grid-cols-1 place-content-center place-items-center">
		{#each panels as panel, index}
			{#if currentPanel == index}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					draggable="true"
					in:fade={ fadeOptions }
					ondragstart={()=> {currentPanel = (currentPanel < panels.length - 1) ? currentPanel + 1 : 0}}
					ontouchstart={()=> {currentPanel = (currentPanel < panels.length - 1) ? currentPanel + 1 : 0}}
				>
					{@render children?.("panel", panel)}
				</div>
			{/if}
		{/each}
	</div>
	<div class="relative grid grid-cols-1 sm:absolute sm:inset-0 sm:place-content-end md:place-content-center">

		<!-- buttons -->
		<div class="flex place-content-between z-10">
			{#each ["left", "right"] as direction}
				{@const rotation = direction === "left" ? "" : "rotate-180"}
				<button
					class="
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
						{ rotation }"
					onclick={ previous }>
					<IconArrowLeftAlt classes="w-[1.5em] h-[1.5em]"/>
				</button>
			{/each}
		</div>

		<!-- counter -->
		<div
			class="absolute inset-0 flex items-center justify-center gap-x-2 sm:hidden">
			{#each panels as panel, i}
				<button
					class="rounded-full h-2 w-2 cursor-pointer { currentPanel == i ? 'bg-maximumYellow' : 'bg-white/20' }"
					onmousedown={()=> {currentPanel = i}}
				/>
			{/each}
		</div>
	</div>
</div>
