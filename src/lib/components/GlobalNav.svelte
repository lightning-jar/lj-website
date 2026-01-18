<script lang="ts">
import { goto } from "$app/navigation";

// components
import HamburgerButton from "$components/HamburgerButton.svelte";
import NavLogoBlock from "$components/NavLogoBlock.svelte";

// refs
let contextMenuButton: HTMLButtonElement | null = $state(null);

// content
const navItems = [
	{ label: "Home", href: "/" },
	{ label: "Services", href: "/services" },
	{ label: "Customer Stories", href: "/customer-stories" },
	{ label: "Testimonials", href: "/testimonials" },
	{ label: "Technologies", href: "/technologies" },
];

// function
function toggleContextMenu() {
	button?.click();
}

function handleClick(e: MouseEvent) {
	console.log("Clicked");
	e.preventDefault();
	toggleContextMenu();
	const target = e.target as HTMLElement;
	const href = target.getAttribute("href");
	if (href) goto(href);
}

let button: HTMLButtonElement | null = $state(null);
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

  <div>
    <HamburgerButton bind:button id="hamburger-menu-button-1"></HamburgerButton>

    <div
      popover="auto"
      id="hamburger-menu"
      class=" bg-oxfordDark absolute inset-0 page-x-padding w-full text-white pt-4 pb-8 min-h-screen lg:pt-6
			xl:pt-8"
    >
      <div class="flex relative pt-0 justify-end">
        <HamburgerButton classes="rotate-45" id="hamburger-menu-button-2"
        ></HamburgerButton>
      </div>
      <div
        class="grid grid-cols-1 gap-5 place-content-center place-items-center font-serif font-700 text-22px sm:text-30px lg:text-48px sm:gap-6 text-accent pt-5"
      >
        {#each navItems as item}
          <a
            href={item.href}
            class="opacity-90 underline-offset-4 decoration-accent/30 hover:opacity-100 hover:underline hover:decoration-accent underline-offset-8 font-display"
            onclick={handleClick}>{item.label}</a
          >
        {/each}
      </div>
    </div>
  </div>
</header>
