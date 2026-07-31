<script lang="ts">
// Lazy hydration: the AI SDK (@ai-sdk/svelte + ai) is NOT imported
// statically, so it stays out of the page's initial bundle. It loads,
// and the Chat instance is constructed, only on the first human
// gesture — focus, pointer, or touch on the card (all three so
// keyboard, mouse, touch, and assistive tech each trigger it). The
// input element is rendered immediately and never unmounts, so typed
// text and focus survive hydration with no swap. Cheap on page load;
// wakes on intent.

import { onMount } from "svelte";

import { pickRandom } from "$utils/pickRandom";

import type { Chat } from "@ai-sdk/svelte";
import type { UIMessage } from "ai";
import type { Attachment } from "svelte/attachments";

// hideClearButton: set by hosts that provide their own reset affordance
// (the homepage launcher's header button calls the exported reset()
// via bind:this); the standalone /concierge page keeps the inline one
let { hideClearButton = false } = $props();

let input = $state("");
let lastError = $state("");
let activated = $state(false);
let chat = $state<Chat<UIMessage> | null>(null);
let inputEl: HTMLInputElement | null = $state(null);
let scroller: HTMLDivElement | null = $state(null);

// the route's refusals are JSON {"error": "..."} — surface the message
// itself when we can parse it
function handleChatError(err: Error) {
	try {
		lastError = JSON.parse(err.message).error ?? err.message;
	} catch {
		lastError = err?.message ?? String(err);
	}
}

// build a fresh Chat with a new conversation id. The dynamic imports are
// ES-module-cached after the first call, so this is instant on reset.
async function newChat(): Promise<Chat<UIMessage>> {
	const [{ Chat: ChatCtor }, { DefaultChatTransport }] = await Promise.all([
		import("@ai-sdk/svelte"),
		import("ai"),
	]);
	return new ChatCtor<UIMessage>({
		transport: new DefaultChatTransport({ api: "/api/concierge" }),
		onError: handleChatError,
	});
}

async function activate() {
	if (activated) return;
	activated = true;
	try {
		chat = await newChat();
	} catch {
		activated = false; // let a later gesture retry
		lastError = "The concierge couldn't load. Refresh and try again.";
	}
}

// clear the conversation: stop any in-flight stream, then start a fresh
// Chat (new id, so the cleared conversation logs separately rather than
// overwriting), and reset the input back to the empty state. Exported
// (a component instance export) so hosts can call it via bind:this.
export async function reset() {
	if (busy) await chat?.stop().catch(() => {});
	try {
		chat = await newChat();
	} catch {
		// keep the existing chat if a rebuild somehow fails
	}
	input = "";
	lastError = "";
	inputEl?.focus();
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

// Safe, whitelist-only markdown rendering of the agent's replies. The
// model emits a small, predictable vocabulary — paragraphs, bullet and
// numbered lists, bold, italic, inline code, and links — so we handle
// exactly those rather than pulling in a full parser + sanitizer.
//
// The guarantee: escape ALL html first, so nothing the model writes can
// become markup; the only tags in the output are ones this function
// introduces from its own templates, over escaped (or already-safe,
// stashed) content. Link destinations are restricted to a single-slash
// root path (NOT `//`, a protocol-relative off-site link) or an explicit
// https:// URL, with quotes and backslashes excluded so a crafted
// destination can't break out of the href attribute or smuggle
// `/\/evil.com` (which browsers may read as `//evil.com`) past the rule.
function renderMarkdownLite(text: string): string {
	// escape everything, then drop the private-use sentinels we use for
	// stashing so model text can't collide with a placeholder
	const escaped = text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;")
		.replace(/[\uE000\uE001]/g, "");

	// bold + italic, applied both to a link's label (a label can itself
	// be **bold**) and to the running text outside links
	const emphasize = (str: string) =>
		str
			.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>")
			.replace(/(?<![*\w])\*([^*\n]+)\*(?!\*)/g, "<em>$1</em>")
			.replace(/(?<![_\w])_([^_\n]+)_(?![_\w])/g, "<em>$1</em>");

	// stash inline code and links as placeholders so the emphasis pass
	// can't mangle their contents (URLs, code with * or _); the label of
	// a link is emphasized here, before it's stashed
	const stash: string[] = [];
	const mask = (html: string) => `\uE000${stash.push(html) - 1}\uE001`;
	let s = escaped
		.replace(/`([^`\n]+)`/g, (_m, code) => mask(`<code>${code}</code>`))
		.replace(
			/\[([^\]]+)\]\((\/(?![/\\])[^)\s"'\\]*|https:\/\/[^)\s"'\\]+|mailto:[^)\s"'\\]+)\)/g,
			(_m, label, href) =>
				mask(
					`<a class="underline decoration-maximumYellow/40 hover:decoration-maximumYellow underline-offset-4" rel="nofollow" href="${href}">${emphasize(label)}</a>`,
				),
		);
	s = emphasize(s);

	// block structure: group consecutive list items into <ul>/<ol>, split
	// the rest into paragraphs on blank lines (single newline → <br>)
	const blocks: string[] = [];
	let list: { tag: "ul" | "ol"; items: string[] } | null = null;
	let para: string[] = [];
	const flushPara = () => {
		if (para.length) blocks.push(`<p>${para.join("<br />")}</p>`);
		para = [];
	};
	const flushList = () => {
		if (list)
			blocks.push(
				`<${list.tag}>${list.items.map((i) => `<li>${i}</li>`).join("")}</${list.tag}>`,
			);
		list = null;
	};
	for (const line of s.split("\n")) {
		const ul = line.match(/^\s*[-*]\s+(.*)$/);
		const ol = line.match(/^\s*\d+\.\s+(.*)$/);
		if (ul || ol) {
			flushPara();
			const tag = ul ? "ul" : "ol";
			if (!list || list.tag !== tag) {
				flushList();
				list = { tag, items: [] };
			}
			list.items.push((ul ?? ol)?.[1] ?? "");
		} else if (line.trim() === "") {
			flushPara();
			flushList();
		} else {
			flushList();
			para.push(line);
		}
	}
	flushPara();
	flushList();

	// restore stashed code/link html; loop so a mask nested inside another
	// (e.g. inline code inside a link label) is fully resolved
	let out = blocks.join("");
	for (let i = 0; i < 3 && /\uE000\d+\uE001/.test(out); i++) {
		out = out.replace(/\uE000(\d+)\uE001/g, (_m, n) => stash[Number(n)] ?? "");
	}
	return out;
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
	"What kind of research is Lightning Jar doing?",
	"What are the key findings of LJ's AEO research?",
	"What is the AEO Playbook?",
	"Have you built transit websites?",
	"What is woof-editor?",
	"What is Replicator?",
];

// SSR and hydration must agree, so the server renders a deterministic
// first-three; the client reshuffles once after mount (Math.random in
// component init would make server and client HTML disagree)
let randomSuggestions = $state(SUGGESTIONS.slice(0, 3));
onMount(() => {
	randomSuggestions = pickRandom(SUGGESTIONS);
});

function stickToBottom(
	// Getter for the "re-pin" signal — read lazily so the attachment
	// body itself never touches reactive state (which would tear the
	// whole thing down on every change)
	repinOn: () => unknown,
	threshold = 100,
): Attachment<HTMLElement> {
	return (el) => {
		let pinned = true;

		const onScroll = () => {
			pinned = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
		};
		const scrollDown = () => {
			if (pinned) el.scrollTo({ top: el.scrollHeight });
		};

		// Child effect: re-runs whenever the signal changes (a message is
		// added), forcing a re-pin even if the user had scrolled away.
		// Effects run after the DOM updates, so scrollHeight is current.
		$effect(() => {
			repinOn(); // register dependency
			pinned = true;
			scrollDown();
		});

		// Streaming tokens: keep pinned as text mutates
		const mo = new MutationObserver(scrollDown);
		mo.observe(el, { childList: true, subtree: true, characterData: true });

		el.addEventListener("scroll", onScroll);
		scrollDown();

		return () => {
			mo.disconnect();
			el.removeEventListener("scroll", onScroll);
		};
	};
}
</script>

<!-- gesture triggers on the card: focusin (keyboard + AT + click into a
     control), pointerenter (mouse), touchstart (touch) — any wakes the
     SDK. Non-interactive handlers on a container are an intentional
     activation heuristic, not a control. -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="gap-4 grid grid-cols-1 {messages.length > 0 && !hideClearButton
    ? 'grid-rows-[auto_minmax(0,1fr)_auto_auto]'
    : 'grid-rows-[minmax(0,1fr)_auto_auto]'} h-full max-h-full place-content-stretch overflow-hidden w-full"
  onfocusin={activate}
  onpointerenter={activate}
  ontouchstart={activate}
>
  <!-- clear conversation (only once there's something to clear; hidden
       when the host supplies its own reset control) -->
  {#if messages.length > 0 && !hideClearButton}
    <div class="flex justify-end">
      <button
        type="button"
        onclick={reset}
        class="text-13px opacity-70 hover:opacity-100 hover:text-maximumYellow underline underline-offset-4 decoration-maximumYellow/30"
      >
        Clear conversation
      </button>
    </div>
  {/if}

  <!-- transcript -->
  <div
    bind:this={scroller}
		{@attach stickToBottom(() => messages.length)}
    class="grid grid-cols-1 grid-rows-[1fr] gap-4 h-full max-h-full overflow-y-scroll place-content-start text-0.9em"
    aria-live="polite"
    aria-label="Conversation"
  >
  	<div class="grid grid-cols-1 h-auto place-content-start min-h-full">
	    {#if messages.length === 0}
	      <p class="opacity-90 mb-3">
	        Ask about the studio's work, research, packages, or writing. A few
	        starters:
	      </p>
	      <div class="flex flex-wrap gap-x-2 gap-y-3 place-content-start">
	        {#each randomSuggestions as suggestion}
	          <button
	            type="button"
	            class="text-14px block border border-maximumYellow/40 text-maximumYellow rounded-full px-3 py-2 leading-snug text-left hover-bg-maximumYellow/3 hover-border-maximumYellow max-h-fit"
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
	          class="justify-self-end max-w-[85%] border border-white/15 bg-white/5 rounded-lg px-4 py-2.5 mb-4"
	        >
	          {textOf(message)}
	        </div>
	      {:else}
	        <div class="leading-relaxed">
	          {#if textOf(message)}
	            <div
	              class="chat-response"
	            >
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
        placeholder="Ask Eljay…"
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
    Answers come from this site's own content and link their
    sources. For anything that matters, email
    <a
      class="underline underline-offset-4"
      href="mailto:hello@lightningjar.com">hello@lightningjar.com</a
    >.
  </p>
</div>
