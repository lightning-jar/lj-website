<script lang="ts">
// context api
import { getContext } from "svelte";

// components
import IconTriangleRight from "$components/IconTriangleRight.svelte";

// props
let { children, youTube = "" } = $props();

// context
let mediaPlayer = getContext("mediaPlayer") as { value: string };
let youTubeCode = getContext("youTubeCode") as { value: string };

// local functions
function launchPlayer(e: MouseEvent) {
	youTubeCode.value = youTube;
	mediaPlayer.value = "show";
	e.stopPropagation();
}
</script>

<button
		class="bg-titaniumYellow text-oxfordBlue px-4 py-2 flex items-center justify-center sm:py-3 sm:px-6 rounded-tl-lg rounded-br-lg hover:shadow-lg transition-shadow"
		onclick={ launchPlayer }
	>
		<div class="mr-3 w-[11px]">
			<IconTriangleRight />
		</div>
		<div>
			{@render children?.()}
		</div>
	</button>