<script lang="ts">
import * as sfx from "$lib/sfx";

// components
import LightningBolt from "$components/LightningBolt.svelte";

import { createAttachmentKey } from "svelte/attachments";

// utils
import { startVisibilityTimer } from "$utils/visibilityTimer";

// types
import type { Attachment } from "svelte/attachments";

// props
let {
	ariaLabel = null,
	containerClasses = "",
	triggerClick = $bindable(),
	classes = "",
	onclick = () => {},
	character = "",
	enableClickMe = false,
	tag = "button",
	title = undefined,
	useImage = false,
}: {
	ariaLabel?: string | null;
	button?: HTMLButtonElement | null;
	classes?: string;
	containerClasses?: string;
	onclick?: () => void;
	character?: string;
	enableClickMe?: boolean;
	tag?: string;
	title?: string;
	triggerClick?: () => void;
	useImage?: boolean;
} = $props();

triggerClick = () => {
	handleBoltClick();
};

// state
let clickMe: HTMLDivElement | null = $state(null);
let lightningState: "inactive" | "active" = $state("inactive");

// derived
let lightningClasses = $derived(
	lightningState !== "inactive"
		? "scale-50000% hover:scale-500000% motion-reduce:scale-200% motion-reduce:hover:scale-200%"
		: "",
);

// functions
function hideClickMe() {
	if (clickMe) clickMe.classList.add("opacity-0");
}

function showClickMe() {
	if (clickMe) clickMe.classList.remove("opacity-0");
}

const clickMeAttachment: Attachment = (element) => {
	// console.log(element.nodeName); // 'DIV'

	startVisibilityTimer({
		target: element,
		durationMs: 1000,
		onEnter: showClickMe,
		onFinish: hideClickMe,
		options: { threshold: 0.25, debug: false },
	});

	return () => {};
};

const clickMeProps = {
	[createAttachmentKey()]: clickMeAttachment,
};

function lightningStrike() {
	// document.body.classList.add("lightning");
	lightningState = "active";
	// after 1 x seconds revert to inactive using timeout
	setTimeout(() => {
		lightningState = "inactive";
	}, 100);
	setTimeout(() => {
		document.body.classList.remove("lightning");
	}, 300);
}

function handleBoltClick() {
	onclick();
	lightningStrike();
	playClick();
}

async function playClick() {
	try {
		sfx.play("click");
		sfx.play("magic");
	} catch (e) {
		console.error("Playback error");
	}
}
</script>

<div
  class="
    aspect-square
    flex
    h-auto
    justify-center
    relative
    {containerClasses}"
>
  {#if tag === "button"}
    <button
      aria-label={ariaLabel}
      {title}
      class="
        cursor-pointer
        flex
        group
        h-full
        items-center
        justify-center
        leading-none
        rounded-full
        w-full
        {classes}"
      onclick={handleBoltClick}
      onmouseenter={(_e) => {
        sfx.play("click");
        if (onclick) {
          onclick();
        }
      }}
    >
      <LightningBolt
        {useImage}
        classes="{lightningClasses} {character
          ? 'hidden group-hover:inline-flex'
          : 'flex w-full h-full'}"
      />

      <!-- optional character -->
      <div
        class={character
          ? "leading-none inline-flex justify-center items-baseline group-hover:hidden "
          : "hidden bg-red"}
      >
        {character}
      </div>
    </button>

    {#if enableClickMe}
      <div
        bind:this={clickMe}
        {...clickMeProps}
        class="text-.9em top-105% left-0 absolute flex justify-center text-nowrap w-full transition-opacity"
      >
        try me!
      </div>
    {/if}
  {/if}

  <!-- inert version for when element is nested inside a link or parent button -->
  {#if tag !== "button"}
    <LightningBolt classes={lightningClasses} {useImage} />
  {/if}
</div>
