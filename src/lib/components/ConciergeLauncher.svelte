<script lang="ts">
// Floating concierge launcher (homepage): a fixed bottom-right button
// that opens a panel wrapping ConciergeChat. The panel mounts on first
// open and then hides via class rather than unmounting, so the
// conversation, typed input, and the lazily-loaded AI SDK all survive
// close/reopen. It never opens itself: a click is the only way in
// (human-origin gesture — the CCRTA-measured cost/abuse fence), and
// ConciergeChat's own gesture-gated hydration is preserved inside.
import ConciergeChat from "$components/ConciergeChat.svelte";
import LightningBolt from "$components/LightningBolt.svelte";

let open = $state(false);
let everOpened = $state(false);
let panelEl: HTMLElement | null = $state(null);
let buttonEl: HTMLButtonElement | null = $state(null);

function toggle() {
	open = !open;
	if (open) {
		everOpened = true;
		// after the panel renders, move focus to the chat input
		requestAnimationFrame(() => {
			panelEl?.querySelector<HTMLInputElement>("input[type='text']")?.focus();
		});
	}
}

function close() {
	if (!open) return;
	open = false;
	buttonEl?.focus();
}

function handleKeydown(event: KeyboardEvent) {
	if (event.key === "Escape") close();
}
</script>

<svelte:window onkeydown={open ? handleKeydown : undefined} />

{#if everOpened}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions — Escape
       handling lives on the window listener; this container only scopes
       the dialog region -->
  <section
    bind:this={panelEl}
    id="concierge-panel"
    aria-label="Concierge chat"
    class="{open ? 'grid' : 'hidden'}
      fixed
      bottom-21
      right-5
      z-50
      w-[min(420px,calc(100vw-2.5rem))]
      h-[min(640px,calc(100dvh-7.5rem))]
      grid-rows-[auto_minmax(0,1fr)]
      gap-0
      bg-oxford
      border
      border-white/14
      rounded-lg
      shadow-2xl
      shadow-black/50
      overflow-hidden
      motion-safe:animate-[fade-in_120ms_ease-out]"
  >
    <header
      class="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/10"
    >
      <h2 class="font-serif font-700 text-16px text-maximumYellow">
        Concierge
      </h2>
      <div class="flex items-center gap-3">
        <a
          href="/concierge"
          class="text-13px opacity-70 hover:opacity-100 hover:text-maximumYellow underline underline-offset-4 decoration-maximumYellow/30"
          >Full page</a
        >
        <button
          type="button"
          onclick={close}
          aria-label="Close the concierge panel"
          class="w-6 h-6 flex items-center justify-center rounded opacity-70 hover:opacity-100 hover:text-maximumYellow focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
        >
          <span aria-hidden="true">✕</span>
        </button>
      </div>
    </header>

    <div class="overflow-y-auto px-4 pt-4 pb-5">
      <ConciergeChat />
    </div>
  </section>
{/if}

<button
  bind:this={buttonEl}
  type="button"
  onclick={toggle}
  aria-expanded={open}
  aria-controls="concierge-panel"
  aria-label={open ? "Close the concierge chat" : "Ask the concierge"}
  class="fixed bottom-5 right-5 z-50 w-13 h-13 flex items-center justify-center rounded-full border border-maximumYellow bg-maximumYellow text-oxford shadow-lg hover:bg-oxford hover:text-maximumYellow transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-oxford"
>
  {#if open}
    <span aria-hidden="true" class="text-18px leading-none">✕</span>
  {:else}
    <span aria-hidden="true" class="w-4.5 block">
      <LightningBolt />
    </span>
  {/if}
</button>
