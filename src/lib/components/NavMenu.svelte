<script lang="ts">
	// components
	import IconChevronDown from "$components/IconChevronDown.svelte";

	// types
	import type { NavDataItem } from "$types/navTypes";

	// props
	let {navItem}: {navItem: NavDataItem} = $props();

	// variables
	let label = $derived(navItem.label);
	let items = $derived(navItem.items);
</script>

<div class="relative.group.ml-10">

	<!-- nav menu button -->
	<button class="text-white text-opacity-80 bg-transparent rounded-md inline-flex items-center transition-opacity group-hover:text-opacity-100 group-focus-within:text-opacity-100 !outline-none underline-offset-4 focus:underline decoration-white/60"
		aria-expanded="false"
		type="button">
		<span>{ label }</span>
		<span class="w-4 h-4">
			<IconChevronDown />
		</span>
	</button>

	<!-- flyout -->
	<div class="absolute z-10 -ml-4 pt-6 px-2 w-auto opacity-0 transition-opacity pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 min-w-[11.625rem] sm:px-0 lg:ml-0 lg:left-1/2 lg:-translate-x-1/2">
		<div class="rounded-lg.shadow-lg.ring-1.ring-black.ring-opacity-5.overflow-hidden">
			<div class="relative.grid.gap-0.px-2.py-2 bg-[#61a10e] sm:gap-0 sm:px-2 sm:pt-2 sm:pb-4">
				{#each items as item}
					<a
						class="px-2 py-1 flex items-center rounded-lg text-opacity-80 transition-opacity text-white hover:underline hover:bg-opacity-10 hover:text-opacity-100 focus:underline underline-offset-4 decoration-white/40 focus:text-opacity-100 transition-colors !outline-none xl:pb-0"
						href={ item.slug ? '/' + item.slug : item.url }
					>
						<div class="text-base peer xl:text-sm">{ item.label }</div>
						<div class="pl-2 flex items-center h-full opacity-0 flex-grow hover:opacity-100 peer-hover:opacity-100 peer">
							<div class="w-4 h-4 -rotate-90 text-accent">
								<IconChevronDown />
							</div>
						</div>
					</a>
				{/each}
			</div>
		</div>
	</div>

</div>