<script lang="ts">
	// import css file
	import "/src/app.css";

	// import components
	import GlobalNav from "$organisms/GlobalNav.svelte";
	import GlobalFooter from "$organisms/GlobalFooter.svelte";

	// props
	export let globalNavEl: HTMLHeadElement;
	export let mainNav: HTMLDivElement;
</script>

<template lang="pug">
	.absolute.w-full
		GlobalNav(
			bind:globalNav!="{ globalNavEl }",
			bind:mainNav!="{ mainNav }"
		)

	slot

	GlobalFooter
</template>
