<script lang="ts">
// Lazy hydration: the AI SDK (@ai-sdk/svelte + ai) is NOT imported
// statically, so it stays out of the page's initial bundle. It loads,
// and the Chat instance is constructed, only on the first human
// gesture — focus, pointer, or touch on the card (all three so
// keyboard, mouse, touch, and assistive tech each trigger it). The
// input element is rendered immediately and never unmounts, so typed
// text and focus survive hydration with no swap. Cheap on page load;
// wakes on intent.
import type { Chat } from "@ai-sdk/svelte";
import type { UIMessage } from "ai";

let input = $state("");
let lastError = $state("");
let activated = $state(false);
let chat = $state<Chat<UIMessage> | null>(null);
let inputEl: HTMLInputElement | null = $state(null);

async function activate() {
	if (activated) return;
	activated = true;
	try {
		const [{ Chat: ChatCtor }, { DefaultChatTransport }] = await Promise.all([
			import("@ai-sdk/svelte"),
			import("ai"),
		]);
		chat = new ChatCtor<UIMessage>({
			transport: new DefaultChatTransport({ api: "/api/concierge" }),
			onError(err) {
				// the route's refusals are JSON {"error": "..."} — surface the
				// message itself when we can parse it
				try {
					lastError = JSON.parse(err.message).error ?? err.message;
				} catch {
					lastError = err?.message ?? String(err);
				}
			},
		});
	} catch {
		activated = false; // let a later gesture retry
		lastError = "The concierge couldn't load. Refresh and try again.";
	}
}

const messages = $derived(chat?.messages ?? []);
const busy = $derived(
	chat?.status === "streaming" || chat?.status === "submitted",
);

async function send(event: SubmitEvent) {
	event.preventDefault();
	const text = input.trim();
	if (!text || busy) return;
	lastError = "";
	if (!chat) await activate();
	if (!chat) return; // activate() failed; lastError already set
	chat.sendMessage({ text });
	input = "";
}

function useSuggestion(suggestion: string) {
	input = suggestion;
	void activate();
	inputEl?.focus();
}

// Minimal, safe rendering of the agent's markdown: escape everything,
// then allow exactly two constructs back — [text](url) links and
// paragraph breaks. No raw HTML from the model ever reaches the DOM.
//
// Destinations are restricted to a single-slash root path (NOT `//`,
// which is a protocol-relative off-site link) or an explicit https://
// URL. Quotes and backslashes are excluded from the match: quotes so a
// crafted destination can't break out of the href attribute, backslashes
// so `/\/evil.com` (which browsers may read as `//evil.com`) can't sneak
// an off-site link past the single-slash rule.
function renderMarkdownLite(text: string): string {
	const escaped = text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
	const linked = escaped.replace(
		/\[([^\]]+)\]\((\/(?![/\\])[^)\s"'\\]*|https:\/\/[^)\s"'\\]+)\)/g,
		(_m, label, href) =>
			`<a class="underline decoration-maximumYellow/40 hover:decoration-maximumYellow underline-offset-4" rel="nofollow" href="${href}">${label}</a>`,
	);
	return linked
		.split(/\n{2,}/)
		.map((p) => `<p>${p.replace(/\n/g, "<br />")}</p>`)
		.join("");
}

function textOf(message: UIMessage): string {
	// a message can carry several text parts (before and after tool
	// calls) — join as paragraphs so they don't run together
	return (message.parts ?? [])
		.filter((p) => p.type === "text")
		.map((p) => ("text" in p ? p.text : ""))
		.filter(Boolean)
		.join("\n\n");
}

function isSearching(message: UIMessage): boolean {
	return (message.parts ?? []).some(
		(p) => p.type.startsWith("tool-") || p.type === "dynamic-tool",
	);
}

const SUGGESTIONS = [
	"What did the research find about llms.txt?",
	"Have you built transit websites?",
	"What is woof-editor?",
];
</script>

<!-- gesture triggers on the card: focusin (keyboard + AT + click into a
     control), pointerenter (mouse), touchstart (touch) — any wakes the
     SDK. Non-interactive handlers on a container are an intentional
     activation heuristic, not a control. -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="grid grid-cols-1 gap-4 max-w-article place-content-start w-full"
  onfocusin={activate}
  onpointerenter={activate}
  ontouchstart={activate}
>
  <!-- transcript -->
  <div
    class="grid grid-cols-1 gap-3 min-h-[16rem] place-content-start bg-white/5 rounded-md px-4 pt-5"
    aria-live="polite"
    aria-label="Conversation"
  >
    {#if messages.length === 0}
      <p class="opacity-70 text-15px">
        Ask about the studio's work, research, packages, or writing. A few
        starters:
      </p>
      <div class="flex flex-wrap gap-x-2 gap-y-3 place-content-start">
        {#each SUGGESTIONS as suggestion}
          <button
            type="button"
            class="text-14px block border border-maximumYellow/40 text-maximumYellow rounded-full px-3 py-2 leading-snug hover-bg-maximumYellow/3 hover-border-maximumYellow max-h-fit"
            onclick={() => useSuggestion(suggestion)}
          >
            {suggestion}
          </button>
        {/each}
      </div>
    {/if}

    {#each messages as message (message.id)}
      {#if message.role === "user"}
        <div
          class="justify-self-end max-w-[85%] border border-white/15 bg-white/5 rounded-lg px-4 py-2.5 text-15px"
        >
          {textOf(message)}
        </div>
      {:else}
        <div class="max-w-[92%] text-15px leading-relaxed">
          {#if textOf(message)}
            <div class="grid grid-cols-1 gap-2 [&_p]:opacity-90">
              <!-- eslint-disable-next-line svelte/no-at-html-tags — output
                   of renderMarkdownLite, which escapes all HTML first -->
              {@html renderMarkdownLite(textOf(message))}
            </div>
          {:else if isSearching(message)}
            <span class="opacity-60 font-mono text-13px"
              >⚡ checking the site…</span
            >
          {/if}
        </div>
      {/if}
    {/each}

    {#if busy && messages.at(-1)?.role === "user"}
      <span class="opacity-60 font-mono text-13px">⚡ thinking…</span>
    {/if}

    {#if lastError}
      <p
        class="text-15px border border-maximumYellow/40 rounded px-4 py-2.5 opacity-90"
      >
        {lastError}
      </p>
    {/if}
  </div>

  <!-- input -->
  <form onsubmit={send} class="flex gap-3 items-center">
    <label class="grow">
      <span class="sr-only">Message the concierge</span>
      <input
        bind:this={inputEl}
        type="text"
        bind:value={input}
        onfocus={activate}
        maxlength="2000"
        placeholder="Ask the concierge…"
        autocomplete="off"
        class="w-full rounded-md border border-current bg-oxfordDark/40 px-4 py-2 text-15px placeholder:text-current/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
      />
    </label>
    <button
      type="submit"
      disabled={busy || !input.trim()}
      class="button-accent !px-3 !rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {busy ? "…" : "Send"}
    </button>
  </form>

  <p class="text-13px opacity-60">
    An experiment. Answers come from this site's own content and link their
    sources. <br />For anything that matters, email
    <a
      class="underline underline-offset-4"
      href="mailto:hello@lightningjar.com">hello@lightningjar.com</a
    >.
  </p>
</div>
