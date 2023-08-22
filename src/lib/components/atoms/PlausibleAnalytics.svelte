<script lang="ts">
	/* cspell:disable */

	// declare variable
	let analytics: boolean;

	// reactive expression
	$: analytics = process.env.NODE_ENV != "development";
</script>

<template lang="pug">
	svelte:head
		+if('analytics')
			script(
				data-domain="lightningjar.com",
				defer,
				src!="https://plausible.io/js/script.js"
			)
</template>
