<script lang="ts">
	// import css file
	import "uno.css"

	// import context api
	import { setContext } from "svelte";

	// import analytics component
	// import PlausibleAnalytics from "$atoms/PlausibleAnalytics.svelte";

	// import components
	import GlobalNav from "$components/GlobalNav.svelte";
	import GlobalFooter from "$components/GlobalFooter.svelte";
	// import MediaPlayer from "$organisms/MediaPlayer.svelte";


	// import child page data
	import { page } from "$app/state";

	// props
	let { children, data } = $props();

	// variables
	let mobileNavState = $state({value:'closed'});
	setContext("mobileNavState", mobileNavState);

	let activeMobileMenu = $state({value:'Main'});
	setContext("activeMobileMenu", activeMobileMenu);

	let brandLink = $state({value:null});
	setContext("brandLink", brandLink);

	let youTubeCode = $state({value:""});
	setContext("youTubeCode", youTubeCode);

	let mediaPlayer = $state({value:"hide"});
	setContext("mediaPlayer", mediaPlayer);


	let mobileNavContainerClasses = $derived(mobileNavState.value === 'open'
		? "translate-x-0 pointer-events-auto transition-transform"
		: "translate-x-[-100vw] pointer-events-none");
</script>

<svelte:head>
	<title> {page.data.metaTitle ?? "Lightning Jar"}</title>
	{#if page.data.metaDescription}
		<meta
			content="{page.data.metaDescription}"
			name="description"
		>
	{/if}
</svelte:head>

	<GlobalNav
		isHome={ data.isHome }
		nav={ data.nav }
	/>
	<!-- MediaPlayer -->
	<div class="bg-blue-500 relative w-full max-w-screen overflow-x-hidden place-self-stretch">
		{@render children?.()}
	</div>

	<GlobalFooter />


