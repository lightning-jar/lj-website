<script lang="ts">
import { goto } from "$app/navigation";

// components
import HamburgerButton from "$components/HamburgerButton.svelte";
import NavLogoBlock from "$components/NavLogoBlock.svelte";

// content
type NavItem = {
	label: string;
	href: string;
	el?: HTMLAnchorElement;
};

let navItems: NavItem[] = $state([
	{ label: "Home", href: "/" },
	{ label: "Blog", href: "/blog" },
	{ label: "About", href: "/about" },
	{ label: "Services", href: "/services" },
	{ label: "Testimonials", href: "/testimonials" },
	{ label: "Customer Stories", href: "/customer-stories" },
	{ label: "Reading List", href: "/reading-list" },
	{ label: "Technologies", href: "/technologies" },
]);

// state
let popover: HTMLDivElement | null = $state(null);
let nav: HTMLElement | null = $state(null);
let openMenuButton: HTMLButtonElement | null = $state(null);
let closeMenuButton: HTMLButtonElement | null = $state(null);
let lastNavItem = $derived(navItems[navItems.length - 1].el);

let popoverState: "closed" | "open" = $state("closed");

// effects
// prevent body scroll when popover is open
$effect(() => {
	if (popoverState === "open") {
		preventBodyScroll();
	} else {
		allowBodyScroll();
	}
});

// helper functions

function updatePopoverState() {
	popoverState = popover?.matches(":popover-open") ? "open" : "closed";
}

function togglePopover() {
	popover?.togglePopover();
	updatePopoverState();
	if (popoverState === "closed") {
		focusOnNavHamburger();
	} else {
		focusOnFirstNavItem();
	}
}

function handleHamburgerClick(e: MouseEvent) {
	e.preventDefault();
	togglePopover();
}

function handleNavItemClick(e: MouseEvent) {
	e.preventDefault();
	togglePopover();
	const target = e.target as HTMLElement;
	const href = target.getAttribute("href");
	if (href) goto(href);
}

function preventBodyScroll() {
	if (!document) return;
	document.body.style.overflow = "hidden";
}

function allowBodyScroll() {
	if (!document) return;
	document.body.style.overflow = "auto";
}

function focusOnNavHamburger() {
	if (openMenuButton) {
		openMenuButton.focus();
	}
}

function focusOnFirstNavItem() {
	const firstNavItem = getFirstNavItem();
	if (firstNavItem) {
		firstNavItem.focus();
	}
}

function getFirstNavItem(): HTMLAnchorElement | null {
	if (!nav) return null;
	// const firstNavItem = nav.querySelector("li:first-child a");
	const firstNavItem = nav?.firstElementChild as HTMLElement | null;
	return firstNavItem instanceof HTMLAnchorElement ? firstNavItem : null;
}

function handleKeydown(e: KeyboardEvent) {
	console.log(e.key);
	if (e.key === "Tab" && popoverState === "open") {
		// if current focus is menuCloseButton
		if (document.activeElement === closeMenuButton) {
			focusOnFirstNavItem();
		}
		// if current focus is lastNavItem
		if (document.activeElement === lastNavItem) {
			focusOnNavHamburger();
		}
	}
}
</script>

<!-- <svelte:document bind:documentElement /> -->
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
    <!-- open menu button -->
    <HamburgerButton
      ariaLabel="Open Menu"
      bind:button={openMenuButton}
      onclick={handleHamburgerClick}
      id="hamburger-menu-button-1"
      popovertarget="hamburger-menu-popover"
      {popoverState}
    ></HamburgerButton>

    <!-- menu modal popover -->
    <div
      bind:this={popover}
      onkeydown={handleKeydown}
      popover="auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hamburger-menu-popover-heading"
      id="hamburger-menu-popover"
      tabindex="-1"
      class=" bg-oxfordDark fixed inset-0 page-x-padding w-full text-white pt-4 pb-8 min-h-screen lg:pt-6
			xl:pt-8"
    >
      <div class="flex relative pt-0 justify-end">
        <!-- close menu button -->
        <HamburgerButton
          ariaLabel="Close Menu"
          onclick={handleHamburgerClick}
          classes="rotate-45"
          id="hamburger-menu-button-2"
          popovertarget="hamburger-menu-popover"
          {popoverState}
        ></HamburgerButton>
      </div>
      <h2 id="hamburger-menu-popover-heading" class="sr-only">
        Site Navigation
      </h2>
      <nav
        aria-label="Primary"
        bind:this={nav}
        class="grid grid-cols-1 gap-5 place-content-center place-items-center font-serif font-700 text-22px sm:text-30px lg:text-48px sm:gap-6 text-accent pt-5"
      >
        {#each navItems as item, index}
          {@const idSlug = item.href.replaceAll("/", "")}
          <a
            id="nav-item-{idSlug || 'home'}"
            bind:this={navItems[index].el}
            href={item.href}
            class="opacity-90 underline-offset-4 decoration-accent/30 hover:opacity-100 hover:underline hover:decoration-accent underline-offset-8 font-display"
            onclick={handleNavItemClick}>{item.label}</a
          >
        {/each}
      </nav>
    </div>
  </div>
</header>
