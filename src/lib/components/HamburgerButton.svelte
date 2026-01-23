<script lang="ts">
import * as sfx from "$lib/sfx";

import { default as hamburgerIcon } from "$assets/hamburger.svg?raw";

let {
	ariaLabel = "toggle menu",
	button = $bindable(null),
	classes = "",
	onclick = () => {},
	popovertarget = "hamburger-menu",
	popoverState = "closed",
	title = "toggle the hamburger menu",
	id = "hamburger-menu-button",
}: {
	ariaLabel?: string;
	classes?: string;
	button?: HTMLButtonElement | null;
	onclick?: (e: MouseEvent) => void;
	popovertarget?: string | null;
	popoverState?: "open" | "closed";
	title?: string | null;
	id?: string | null;
} = $props();
</script>

<button
  aria-controls={popovertarget}
  aria-expanded={popoverState === "open"}
  aria-label={ariaLabel}
  bind:this={button}
  onclick={(e) => {
    sfx.play("click");
    if (onclick) {
      onclick(e);
    }
  }}
  class="
  border
  border-slate-100/40
    bg-slate-100/5
    w-7
    h-7
    flex
    group
    justify-end
    items-center
    max-fit-w
    rounded-full
    border-current
    lg:h-8
    lg:w-8
    p-5px
    overflow-hidden
    opacity-40
    text-slate-100
    hover:(text-accent opacity-100 border-accent)
    {classes}"
  {popovertarget}
  {title}
  {id}
>
  {@html hamburgerIcon.replace("w-full h-auto", "w-full h-auto fill-current")}
</button>
