<script lang="ts">
	let { children, classes = ""} = $props();
</script>

<section class="bg-white text-OxfordBlue relative page-x-padding { classes }">
	{@render children?.()}
</section>
