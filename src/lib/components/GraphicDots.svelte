<script lang="ts">
	import type { Attachment } from 'svelte/attachments';

	let {classes = ""} = $props();

	const addStyle: Attachment = (el) => {
		if (el instanceof HTMLElement) {
			el.style.backgroundImage = "radial-gradient(currentColor 20%, transparent 20%); background-position: 0 0, 50%";
		}
	};

</script>

<div class="pointer-events-none -z-1" aria-hidden="true">
	<!-- use css radial gradient to create dots -->
	<div
		{@attach addStyle}
		id="dot-grid"
		class="absolute text-maximumYellow bottom-0 right-0 w-2/5 aspect-square {classes}"
		aria-hidden="true"
	>
		<!--polyfill for aspect ratio -->
		<div class="h-0 w-full pt-[100%]"></div>
	</div>
</div>
