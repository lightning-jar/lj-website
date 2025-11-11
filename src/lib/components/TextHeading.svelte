<script lang="ts">
	// props
	let { children, classes = "", tag = "h2" } = $props();

	const defaultClasses = [
		"text-4xl",
		"sm:text-[2.5rem]",
		"md:text-5xl",
		"xl:text-[3.25rem]",
		"font-serif",
		"font-bold",
		"",
	];

	let allClasses = $derived(`${defaultClasses.join(" ")}  ${classes}`);
</script>


	<svelte:element
		class="{ allClasses }"
		this="{ tag }"
	>
		{@render children?.()}
	</svelte:element>

