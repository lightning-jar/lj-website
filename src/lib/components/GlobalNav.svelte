<script lang="ts">
import { goto } from "$app/navigation";

// components
import HamburgerButton from "$components/HamburgerButton.svelte";
import NavLogoBlock from "$components/NavLogoBlock.svelte";
import NavSearch from "$components/NavSearch.svelte";

// desktop top-nav (lg+): links + dropdown menus
const desktopLinks = [{ label: "Blog", href: "/blog" }];
const desktopMenus = [
	{
		key: "research",
		label: "Research",
		items: [
			{ label: "Overview", href: "/research" },
			{ label: "Barkup Bench", href: "/research/barkup-bench" },
			{ label: "AEO Bench", href: "/research/aeo-bench" },
		],
	},
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
			{ label: "Concierge", href: "/concierge" },
		],
	},
];
let openDesktopMenu: string | null = $state(null);

// mobile nav (below lg): a flat "Home"/"Blog" plus the same grouped
// menus as desktop, rendered as tap-to-expand accordions — the
// touch-friendly form of the desktop flyouts, so every link is reachable
type MobileEntry =
	| { type: "link"; label: string; href: string }
	| { type: "menu"; key: string; label: string; items: NavLink[] };
type NavLink = { label: string; href: string };
const mobileNav: MobileEntry[] = [
	{ type: "link", label: "Home", href: "/" },
	{ type: "link", label: "Blog", href: "/blog" },
	...desktopMenus.map(
		(m): MobileEntry => ({
			type: "menu",
			key: m.key,
			label: m.label,
			items: m.items,
		}),
	),
];
let openMobileMenu: string | null = $state(null);
function toggleMobileMenu(key: string) {
	openMobileMenu = openMobileMenu === key ? null : key;
}

// state
let popover: HTMLDivElement | null = $state(null);
let nav: HTMLElement | null = $state(null);
let openMenuButton: HTMLButtonElement | null = $state(null);

let popoverState: "closed" | "open" = $state("closed");

// effects
// prevent body scroll when popover is open
$effect(() => {
	if (popoverState === "open") {
		preventBodyScroll();
	} else {
		allowBodyScroll();
		openMobileMenu = null; // collapse accordions when the menu closes
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
        class="grid grid-cols-1 max-w-md mx-auto w-full font-sans text-19px pt-6"
      >
        {#each mobileNav as entry (entry.label)}
          {#if entry.type === "link"}
            <a
              href={entry.href}
              class="block py-3 border-b border-white/10 text-accent opacity-90 hover:opacity-100"
              onclick={handleNavItemClick}>{entry.label}</a
            >
          {:else}
            <div class="border-b border-white/10">
              <button
                type="button"
                aria-expanded={openMobileMenu === entry.key}
                class="w-full flex items-center justify-between py-3 text-left text-accent opacity-90 hover:opacity-100"
                onclick={() => toggleMobileMenu(entry.key)}
              >
                {entry.label}
                <svg
                  class="w-4 h-4 transition-transform {openMobileMenu ===
                  entry.key
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
              {#if openMobileMenu === entry.key}
                <div
                  class="grid grid-cols-1 pl-4 ml-1 mb-2 border-l border-accent/30"
                >
                  {#each entry.items as item (item.href)}
                    <a
                      href={item.href}
                      class="block py-2 text-16px text-white/85 hover:text-accent"
                      onclick={handleNavItemClick}>{item.label}</a
                    >
                  {/each}
                </div>
              {/if}
            </div>
          {/if}
        {/each}
      </nav>
    </div>
  </div>
</header>
