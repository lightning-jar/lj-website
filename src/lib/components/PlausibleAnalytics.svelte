<script lang="ts">
	/* cspell:disable */

	// declare variable
	let { analytics }: { analytics: boolean } = $props();

	// reactive expression
	let showAnalytics = $derived(analytics !== false && process.env.NODE_ENV !== "development");
</script>

	<svelte:head>
		{#if showAnalytics}
			<script
				data-domain="lightningjar.com"
				defer
				src="https://plausible.io/js/script.js"></script>
		{/if}
	</svelte:head>
