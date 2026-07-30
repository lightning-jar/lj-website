<script lang="ts">
import { Chat } from "@ai-sdk/svelte";
import { DefaultChatTransport } from "ai";

let input = $state("");
let lastError = $state("");

const chat = new Chat({
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

const busy = $derived(
	chat.status === "streaming" || chat.status === "submitted",
);

function send(event: SubmitEvent) {
	event.preventDefault();
	const text = input.trim();
	if (!text || busy) return;
	lastError = "";
	chat.sendMessage({ text });
	input = "";
}

// Minimal, safe rendering of the agent's markdown: escape everything,
// then allow exactly two constructs back — [text](url) links (root-
// relative or https only) and paragraph breaks. No raw HTML from the
// model ever reaches the DOM.
function renderMarkdownLite(text: string): string {
	const escaped = text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
	// quotes are additionally excluded from the URL match so a crafted
	// destination can never break out of the href attribute
	const linked = escaped.replace(
		/\[([^\]]+)\]\(((?:\/|https:\/\/)[^)\s"']+)\)/g,
		(_m, label, href) =>
			`<a class="underline decoration-maximumYellow/40 hover:decoration-maximumYellow underline-offset-4" href="${href}">${label}</a>`,
	);
	return linked
		.split(/\n{2,}/)
		.map((p) => `<p>${p.replace(/\n/g, "<br />")}</p>`)
		.join("");
}

function textOf(message: (typeof chat.messages)[number]): string {
	// a message can carry several text parts (before and after tool
	// calls) — join as paragraphs so they don't run together
	return (message.parts ?? [])
		.filter((p) => p.type === "text")
		.map((p) => ("text" in p ? p.text : ""))
		.filter(Boolean)
		.join("\n\n");
}

function isSearching(message: (typeof chat.messages)[number]): boolean {
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

<div class="grid grid-cols-1 gap-4 max-w-article w-full">
  <!-- transcript -->
  <div
    class="grid grid-cols-1 gap-3 min-h-[16rem]"
    aria-live="polite"
    aria-label="Conversation"
  >
    {#if chat.messages.length === 0}
      <p class="opacity-70 text-15px">
        Ask about the studio's work, research, packages, or writing. A few
        starters:
      </p>
      <div class="flex flex-wrap gap-2">
        {#each SUGGESTIONS as suggestion}
          <button
            type="button"
            class="text-14px border border-maximumYellow/40 text-maximumYellow rounded-full px-3 py-1.5 hover:bg-maximumYellow/10"
            onclick={() => {
              input = suggestion;
            }}
          >
            {suggestion}
          </button>
        {/each}
      </div>
    {/if}

    {#each chat.messages as message (message.id)}
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

    {#if busy && chat.messages.at(-1)?.role === "user"}
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
  <form onsubmit={send} class="flex gap-2 items-end">
    <label class="grow">
      <span class="sr-only">Message the concierge</span>
      <input
        type="text"
        bind:value={input}
        maxlength="2000"
        placeholder="Ask the concierge…"
        autocomplete="off"
        class="w-full rounded-lg border border-current bg-oxfordDark/40 px-4 py-2.5 text-15px placeholder:text-current/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
      />
    </label>
    <button
      type="submit"
      disabled={busy || !input.trim()}
      class="button-accent rounded-lg px-4 py-2.5 text-15px disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {busy ? "…" : "Send"}
    </button>
  </form>

  <p class="text-13px opacity-60">
    An experiment. Answers come from this site's own content and link their
    sources; for anything that matters, email
    <a
      class="underline underline-offset-4"
      href="mailto:hello@lightningjar.com">hello@lightningjar.com</a
    >.
  </p>
</div>
