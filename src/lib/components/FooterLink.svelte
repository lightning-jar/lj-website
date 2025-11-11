<script lang="ts">
	let {children, classes = "", href = ""} = $props();
</script>

<a
	class="hover:text-maximumYellow hover:opacity-100 transition-all underline underline-offset-4 decoration-slate-500 {classes}"
	{ href }
>
	{@render children?.()}
</a>
