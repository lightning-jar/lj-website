<script lang="ts">
  // components
  import LightningBolt from "$components/LightningBolt.svelte";

  import { createAttachmentKey } from "svelte/attachments";

  // utils
  import { startVisibilityTimer } from "$utils/visibilityTimer";

  // types
  import type { Attachment } from "svelte/attachments";

  // props
  let { classes = "", onclick = () => {}, character = "→" } = $props();

  // state
  let clickMe: HTMLDivElement | null = $state(null);

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
</script>

<div class="relative">
  <button
    title="Click me."
    class="
  text-maximumYellow
  group
  hover:bg-maximumYellow
  hover:text-oxford
  rounded-full
  border
  flex
  items-center
  justify-center
  aspect-square
  w-8
  h-8
  p-10px
  leading-none
  {classes}"
    onclick={() => onclick()}
  >
    <span class={character ? "hidden group-hover:inline-block" : ""}
      ><LightningBolt /></span
    >
    <span
      class={character
        ? "group-hover:hidden leading-none inline-flex justify-center items-baseline"
        : "hidden"}>{character}</span
    >
  </button>
  <div
    bind:this={clickMe}
    {...clickMeProps}
    class="text-.9em top-105% left-0 absolute flex justify-center text-nowrap w-full transition-opacity"
  >
    <span>try me!</span>
  </div>
</div>
