<script lang="ts">
	// type
	import type { Snippet } from "svelte";

	// Props type
	interface Props {
		classes?: string;
		column1?: Snippet;
		column2?: Snippet;
	}
	// props
	let {column1 = undefined, column2 = undefined, classes = ""}: Props = $props();
</script>


<div class="relative { classes } lg:grid grid-cols-3">
	<div>
		{@render column1?.()}
	</div>

	<div class="flex w-full h-full justify-center items-center">
		<div class="font-thin text-[50px] text-androidGreen">+</div>
	</div>

	<div>
		{@render column2?.()}
	</div>
</div>
