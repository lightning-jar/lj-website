<script lang="ts">
	// components
	import NavItemComponent from "$components/NavItem.svelte";
	import NavMenu from "$components/NavMenu.svelte";

	// types
	import type { NavItem } from "$types/types";

	// props
	let { nav }: { nav: NavItem[] } = $props();

	// variables
	let item: NavItem;
</script>

<nav
	id="mainNav"
	class="lg:flex lg:gap-x-6 lg:pt-[.35rem] min-h-[3.75em] items-center xl:min-h-[3.5rem]"
>
	{#each nav as item}
		{#if item?.menu}
			<NavMenu navItem="{ item }"/>
		{:else}
			<NavItemComponent navItem="{ item }"/>
		{/if}
	{/each}
</nav>

