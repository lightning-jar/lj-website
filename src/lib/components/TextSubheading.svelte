<script lang="ts">
	let { children, classes = "" } = $props();

	const defaultClasses = [
		"text-xl",
		"lg: text-xl",
		"font-sans",
		"font-semibold",
		"italic",
		"mb-4",
		"text-darkCornflowerBlue"
	];

	let allClasses = $derived(`${defaultClasses.join(" ")} ${classes}`);
</script>

<h3 class="{allClasses}">
	{@render children?.()}
</h3>
