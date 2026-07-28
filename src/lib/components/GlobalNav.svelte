<script lang="ts">
import { goto } from "$app/navigation";

// components
import HamburgerButton from "$components/HamburgerButton.svelte";
import NavLogoBlock from "$components/NavLogoBlock.svelte";
import NavSearch from "$components/NavSearch.svelte";

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
	{ label: "Research", href: "/research" },
	{ label: "Testimonials", href: "/testimonials" },
	{ label: "Customer Stories", href: "/customer-stories" },
	{ label: "Reading List", href: "/reading-list" },
	{ label: "Technologies", href: "/technologies" },
	{ label: "Packages & Tools", href: "/packages" },
	{ label: "Fun", href: "/fun" },
]);

// desktop top-nav (lg+): links + dropdown menus
const desktopLinks = [
	{ label: "Blog", href: "/blog" },
	{ label: "Research", href: "/research" },
];
const desktopMenus = [
	{
		key: "about",
		label: "About Us",
		items: [
			{ label: "About", href: "/about" },
			{ label: "Services", href: "/services" },
			{ label: "Testimonials", href: "/testimonials" },
			{ label: "Technologies", href: "/technologies" },
			{ label: "Customer Stories", href: "/customer-stories" },
		],
	},
	{
		key: "more",
		label: "More",
		items: [
			{ label: "Packages & Tools", href: "/packages" },
			{ label: "Reading List", href: "/reading-list" },
			{ label: "Fun", href: "/fun" },
		],
	},
];
let openDesktopMenu: string | null = $state(null);

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

function toggleDesktopMenu(key: string) {
	openDesktopMenu = openDesktopMenu === key ? null : key;
}

// close an open dropdown when focus or clicks leave the nav
function handleDesktopMenuFocusOut(e: FocusEvent) {
	const container = e.currentTarget as HTMLElement;
	if (!container.contains(e.relatedTarget as Node)) openDesktopMenu = null;
}

function handleWindowClick(e: MouseEvent) {
	if (!openDesktopMenu) return;
	const target = e.target as HTMLElement | null;
	if (!target?.closest("[data-desktop-menu]")) openDesktopMenu = null;
}

function handleWindowKeydown(e: KeyboardEvent) {
	if (e.key === "Escape") openDesktopMenu = null;
}

function handleKeydown(e: KeyboardEvent) {
	console.log(e.key);
	if (e.key === "Tab" && popoverState === "open") {
		// natural DOM order flows close button → search → nav items;
		// loop back to the top from the last nav item
		if (document.activeElement === lastNavItem) {
			focusOnNavHamburger();
		}
	}
}
</script>

<svelte:window onclick={handleWindowClick} onkeydown={handleWindowKeydown} />

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

  <!-- desktop top-nav (lg+) -->
  <nav aria-label="Primary" class="hidden lg:flex items-center gap-8">
    {#each desktopLinks as link}
      <a
        href={link.href}
        class="opacity-90 underline-offset-4 decoration-accent/30 hover:(opacity-100 text-accent)"
      >
        {link.label}
      </a>
    {/each}
    {#each desktopMenus as menu}
      <div
        class="relative"
        data-desktop-menu
        onfocusout={handleDesktopMenuFocusOut}
      >
        <button
          type="button"
          aria-expanded={openDesktopMenu === menu.key}
          aria-haspopup="true"
          class="flex items-center gap-1.5 opacity-90 hover:(opacity-100 text-accent) {openDesktopMenu ===
          menu.key
            ? 'text-accent opacity-100'
            : ''}"
          onclick={() => toggleDesktopMenu(menu.key)}
        >
          {menu.label}
          <svg
            class="w-3 h-3 transition-transform {openDesktopMenu === menu.key
              ? 'rotate-180'
              : ''}"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            aria-hidden="true"
          >
            <path d="M2.5 4.5 L6 8 L9.5 4.5" />
          </svg>
        </button>
        {#if openDesktopMenu === menu.key}
          <div
            class="absolute right-0 top-full mt-3 min-w-44 grid grid-cols-1 rounded-sm border border-white/14 bg-oxfordDark py-2 shadow-lg z-10"
          >
            {#each menu.items as item}
              <a
                href={item.href}
                class="px-4 py-1.5 whitespace-nowrap opacity-90 hover:(opacity-100 text-accent bg-white/5)"
                onclick={() => {
                  openDesktopMenu = null;
                }}
              >
                {item.label}
              </a>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
    <NavSearch />
  </nav>

  <div class="lg:hidden">
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
      <div class="max-w-md mx-auto w-full pt-4">
        <NavSearch variant="mobile" onNavigate={togglePopover} />
      </div>
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
