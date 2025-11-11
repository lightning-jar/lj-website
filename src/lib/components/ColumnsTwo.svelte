<script lang="ts">
	// type
	import type { Snippet } from "svelte";

	// interface
	interface Props {
		classes?: string;
		column1?: Snippet;
		column2?: Snippet;
	}
	let {classes = "", column1 = undefined, column2 = undefined}: Props = $props();
</script>

<div
	class="md:grid md:grid-cols-2 {classes}"
>
	<div>
		{@render column1?.()}
	</div>
	<div>
		{@render column2?.()}
	</div>
</div>
