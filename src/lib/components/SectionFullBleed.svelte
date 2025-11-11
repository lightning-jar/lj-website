<script lang="ts">
	// types
	import type { Snippet } from "svelte";

	// props
	let { children, classes = "bg-transparent", id = null }: { children?: Snippet, classes?: string, id?: string | null } = $props();
</script>

<section
	class="text-white relative { classes }"
	{id}>
	{@render children?.()}
</section>
