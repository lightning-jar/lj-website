<script lang="ts">
  import { default as hamburgerIcon } from "$assets/hamburger.svg?raw";

  let {
    button = $bindable(null),
    classes = "",
    popovertarget = "hamburger-menu",
    title = "toggle the hamburger menu",
    id = "hamburger-menu-button",
  }: {
    classes?: string;
    button?: HTMLButtonElement | null;
    popovertarget?: string | null;
    title?: string | null;
    id?: string | null;
  } = $props();
</script>

<button
  aria-label="toggle menu"
  bind:this={button}
  class="
  border
  border-current
    w-7
    h-7
    flex
    group
    hover:bg-maximumYellow-100/10
    justify-end
    items-center
    max-fit-w
    rounded-full
    border-current
    lg:h-8
    lg:w-8
    p-5px
    overflow-hidden
    text-slate-100
    hover:text-accent
    {classes}"
  {popovertarget}
  {title}
  {id}
>
  {@html hamburgerIcon.replace("w-full h-auto", "w-full h-auto fill-current")}
</button>
