<script lang="ts">
import { createAttachmentKey } from "svelte/attachments";

// utils
import { startVisibilityTimer } from "$utils/visibilityTimer";

// types
import type { Attachment } from "svelte/attachments";

// state
let button: HTMLButtonElement | null = $state(null);

// functions
function hide() {
	if (button) button.classList.add("opacity-0");
}

function show() {
	if (button) button.classList.remove("opacity-0");
}

const buttonAttachment: Attachment = (_element) => {
	//
	const top = document.getElementById("top");

	if (!top) return;

	startVisibilityTimer({
		target: top,
		durationMs: 1000,
		onEnter: hide,
		onExit: show,
		onFinish: () => {},
		options: { threshold: 0.25, debug: false },
	});

	return () => {};
};

const buttonProps = {
	[createAttachmentKey()]: buttonAttachment,
};
</script>

<!-- back to top -->
<button
  {...buttonProps}
  bind:this={button}
  onclick={() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }}
  id="back-to-top"
  class="fixed bottom-5 right-5 z-50 flex items-center justify-center rounded-full bg-white/50 backdrop-blur p-3 shadow-lg transition-all duration-300 hover:bg-slate-100 hover:text-oxford text-14px"
  aria-label="Back to top"
>
  <span>Back to top</span>
</button>
