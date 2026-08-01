<script lang="ts">
// Floating concierge launcher (homepage), built on the native popover
// API: the panel lives in the top layer (no z-index management), the
// launcher toggles it declaratively via popovertarget, and popover=auto
// gives Escape-to-close and light dismiss for free. The panel is always
// in the DOM (closed popovers are display:none), so the conversation,
// typed input, and the lazily-loaded AI SDK survive close/reopen —
// and ConciergeChat's gesture-gated hydration still defers the SDK
// until a human actually interacts with the chat.
//
// Positioning: CSS anchor positioning pins the panel to the launcher
// where supported; the fixed bottom/right utilities remain as the
// fallback for browsers without anchor support.
import ConciergeChat from "$components/ConciergeChat.svelte";
import LightningBolt from "$components/LightningBolt.svelte";

let open = $state(false);
let panelEl: HTMLElement | null = $state(null);
// component instance: exposes ConciergeChat's exported reset()
let chatApi: ReturnType<typeof ConciergeChat> | null = $state(null);

// track the popover's real state for the icon/label swap; on open, move
// focus to the chat input (the browser returns focus to the launcher
// when the popover closes)
function handleToggle(event: ToggleEvent) {
	open = event.newState === "open";
	if (open) {
		panelEl?.querySelector<HTMLInputElement>("input[type='text']")?.focus();
	}
}
</script>

<section
  bind:this={panelEl}
  id="concierge-panel"
  popover="auto"
  ontoggle={handleToggle}
  aria-label="Ask Eljay chat"
  class="
    bg-oxford
    text-cultured
    border
    border-white/14
    bottom-21
    inset-auto
    fixed
    gap-0
    grid
    grid-rows-[auto_minmax(0,1fr)]
    h-[min(640px,calc(100dvh-7.5rem))]
    m-0
    motion-safe:animate-[fade-in_120ms_ease-out]
    overflow-hidden
    right-5
    rounded-lg
    shadow-2xl
    shadow-black/50
    w-[min(420px,calc(100vw-2.5rem))]"
>
  <header
    class="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/10"
  >
    <h2 class="font-serif font-700 text-16px text-maximumYellow">
      Ask Eljay <span class="hidden lg-inline">(Our Agent)</span>
    </h2>
    <div class="flex items-center gap-3">
      <button
        type="button"
        onclick={() => chatApi?.reset()}
        aria-label="Clear the current conversation"
        class="button-xsmall"
      >
        <span aria-hidden="true" class="i-ph-arrow-clockwise-bold"></span>
      </button>
      <a href="/ask-eljay" class="button-xsmall" aria-label="Open Ask Eljay as a full page">↗</a>
      <button
        type="button"
        popovertarget="concierge-panel"
        popovertargetaction="hide"
        aria-label="Close the Ask Eljay panel"
        class="button-xsmall"
      >
        <span aria-hidden="true">✕</span>
      </button>
    </div>
  </header>

  <div class="bg-blue/5 h-full px-4 pt-4 pb-6">
    <ConciergeChat bind:this={chatApi} hideClearButton />
  </div>
</section>

<button
  type="button"
  popovertarget="concierge-panel"
  aria-label={open ? "Close the Ask Eljay chat" : "Ask Eljay, our AI assistant"}
  class="concierge-launcher fixed bottom-5 right-5 z-50 w-13 h-13 flex items-center justify-center rounded-full border border-maximumYellow bg-maximumYellow text-oxford shadow-lg hover:bg-oxford hover:text-maximumYellow transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-oxford"
>
  {#if open}
    <span aria-hidden="true" class="text-18px leading-none">✕</span>
  {:else}
    <span aria-hidden="true" class="w-4.5 block">
      <LightningBolt />
    </span>
  {/if}
</button>

<style>
	/* Anchor positioning (progressive enhancement): pin the panel to the
	   launcher button so the pair can never drift apart. Browsers without
	   anchor support keep the fixed bottom/right utility fallback above. */
	.concierge-launcher {
		anchor-name: --concierge-launcher;
	}

	@supports (anchor-name: --a) {
		#concierge-panel {
			position-anchor: --concierge-launcher;
			top: auto;
			left: auto;
			bottom: calc(anchor(top) + 0.75rem);
			right: anchor(right);
		}
	}
</style>
