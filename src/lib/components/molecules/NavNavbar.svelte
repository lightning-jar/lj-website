<script lang="ts">
	// components
	import NavItem from "$atoms/NavItem.svelte";
	import NavMenu from "$molecules/NavMenu.svelte";

	// props
	export let navData;
	export let mainNav: HTMLElement | null = null;
	export let section: string = "";
</script>

<template lang="pug">
	nav#mainNav.hidden(
		class="lg:flex md:pt-[.35rem] min-h-[3.75rem] items-center xl:text-sub xl:min-h-[3.5rem]",
		class!="{ section == 'home' ? 'navbar-bg-home' : '' }",
		bind:this!="{ mainNav }"
	)
		+each('navData as navItem')
			+if('navItem.type == "Menu"')
				NavMenu(navItem!="{ navItem }")
				+else
					NavItem(navItem!="{ navItem }")
</template>
