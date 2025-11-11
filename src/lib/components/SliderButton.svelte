<script lang="ts">
	// components
	import IconArrowLeftAlt from "$components/IconArrowLeftAlt.svelte";

	// props
	let { direction } = $props();
	let rounded = $derived(direction === "left" ? "rounded-l" : "rounded-r");

	let buttonClasses = $derived(`
	bg-blue-500/10
	${rounded}
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
	sm:hover:bg-opacity-40`);
</script>


	<div class="{ buttonClasses }">
		<div class="w-4 h-4 { direction == 'left' ? '' : 'rotate-180' }">
			<IconArrowLeftAlt />
		</div>
	</div>

