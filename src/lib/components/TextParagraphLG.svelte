<script lang="ts">
	let { children, classes = "" } = $props();
</script>

<p class="opacity-95 xl:text-xl 2xl:text-2xl !leading-none {classes }">
	{@render children?.()}
</p>
