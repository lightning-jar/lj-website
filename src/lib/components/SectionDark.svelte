<script lang="ts">
	// props
	let { children, classes = "bg-transparent", id } = $props();
</script>

<section class="text-white relative page-x-padding { classes }" {id}>
	{@render children?.()}
</section>

