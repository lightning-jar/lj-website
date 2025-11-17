<script lang="ts">
  // components
  // import ButtonHamburger from "$components/ButtonHamburger.svelte";
  import NavLogoBlock from "$components/NavLogoBlock.svelte";

  // types
  import type { NavItem } from "$types/types";

  // props
  let { nav }: { nav: NavItem[] } = $props();

  // refs
  let contextMenuButton: HTMLButtonElement | null = $state(null);

  // content
  const navItems = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Customer Stories", href: "/customer-stories" },
    { label: "Testimonials", href: "/testimonials" },
  ];

  // function
  function toggleContextMenu() {
    contextMenuButton?.click();
  }
</script>

<header
  id="top"
  class="
			flex
			items-center
			justify-between
			md:space-x-10
			min-h-[3.75rem]
			page-x-padding
			pt-4
			relative
			text-neutral-50
			w-full
			lg:pt-6
			xl:pt-8
			xl:min-h-[3.5rem]
			z-1"
>
  <NavLogoBlock />

  <button
    class="group hover:bg-slate-100/10 hover:opacity-100 h-auto grid grid-cols-1 gap-4.5px place-items-center place-content-center leading-0 relative rounded-sm py-4px px-5px opacity-60 mr-0 -top-5px"
    popovertarget="contextMenu"
    id="context-menu-button"
  >
    {#each Array(3) as _item, index}
      <div
        class="
          aspect-square
          bg-slate-100
          flex
          h-4px
          items-center
          justify-center
          leading-0
          rounded-full
          text-10px
          w-4px
          group-hover-bg-accent"
      ></div>
    {/each}
  </button>

  <div
    popover="auto"
    id="contextMenu"
    class=" bg-oxfordDark relative page-x-padding w-full text-white pt-6 pb-8 min-h-screen"
  >
    <div class="flex relative pt-4">
      <button
        bind:this={contextMenuButton}
        class="absolute top-0 right-0"
        popovertarget="contextMenu"
        >✕
      </button>
    </div>
    <div
      class="grid grid-cols-1 gap-5 place-content-center place-items-center font-serif font-700 text-22px sm:text-30px sm:gap-6 text-accent"
    >
      {#each navItems as item}
        <a
          href={item.href}
          class="opacity-90 underline-offset-4 decoration-accent/30 hover:opacity-100 hover:underline hover:decoration-accent"
          onclick={toggleContextMenu}>{item.label}</a
        >
      {/each}
    </div>
  </div>
</header>
