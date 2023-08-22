<script lang="ts">
	// import css file
	import "/src/app.css";

	// import stores
	import { mobileNavOpen } from "$stores/navStore";

	// import analytics component
	import PlausibleAnalytics from "$atoms/PlausibleAnalytics.svelte";

	// import components
	import GlobalNav from "$organisms/GlobalNav.svelte";

	// local types
	import type { LayoutData } from "./$types";

	// import child page data
	import { page } from "$app/stores";

	// props
	export let data: LayoutData;

	// variables
	let mobileNavContainerClasses: string;
	$: mobileNavContainerClasses = $mobileNavOpen
		? "translate-x-0 pointer-events-auto transition-transform"
		: "translate-x-[-100vw] pointer-events-none";
</script>

<template lang="pug">
	//- analytics
	PlausibleAnalytics

	//- head metadata
	svelte:head
		title { $page.data.metaTitle ?? "Sage Energy" }
		+if('$page.data.metaDescription')
			meta(
				content!="{ $page.data.metaDescription }",
				name="description"
			)

	GlobalNav(
		isHome!="{ data.isHome }",
		nav!="{ data.nav }"
	)
	slot
	//- GlobalFooter

	//- //- mobile nav
	//- .fixed.top-0.left-0.z-30.h-screen.w-screen(
	//- 	class!="{mobileNavContainerClasses} md:hidden"
	//- )
	//- 	//- spacer for header
	//- 	.w-full.bg-oxford(class="h-[60px]")

	//- 	//- mobile nav inner container
	//- 	.relative.w-full.h-full.pt-8.bg-neutral-100.shadow-xl
	//- 		//-MobileMenu(nav!="{ data.nav }")
</template>
