<script lang="ts">
	//- imports
	import type { NavDataItem } from "$types/navTypes";

	//- props
	let { navItem }: { navItem: NavDataItem } = $props();

	//- variables
	let label = $derived(navItem.label);
	let slug = $derived(navItem.slug);
</script>

{#if label && slug}
	<a
	 class="
	 	font-serif
		block
		text-white
		text-opacity-95
		ml-10
		group
		transition-colors
		lg:text-lg
		xl:text-xl
		hover:text-opacity-100
		hover:text-maximumYellow
		!outline-none"
		href="/{slug}"
	>
		<span class="group-focus:underline underline-offset-4">{ label }</span>
	</a>
{/if}

