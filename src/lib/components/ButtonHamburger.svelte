<script lang="ts">
// context api
import { getContext } from "svelte";

// get nav state
const navState = getContext("navState") as {
	value: {
		mobileNavState: string;
		activeMobileMenu: string;
		brandLink: HTMLAnchorElement | null;
	};
};

// functions
function getFirstItemInActiveMobileMenu():
	| HTMLAnchorElement
	| HTMLButtonElement {
	// get the active mobile menu i
	const menu = document.querySelector(
		`[data-mobile-menu="${navState.value.activeMobileMenu}"]`,
	);
	const container = menu?.firstElementChild as HTMLDivElement;
	const activeMobileMenuFirstItem = container?.firstElementChild as
		| HTMLAnchorElement
		| HTMLButtonElement;

	// return the first item in the active mobile menu
	return activeMobileMenuFirstItem;
}
function toggleMobileMenu() {
	// if closed, open the menu, and put focus on the first menu item
	navState.value.mobileNavState =
		navState.value.mobileNavState === "open" ? "closed" : "open";
	console.log(navState.value.mobileNavState);
}
function handleKeydown(event: KeyboardEvent) {
	// if the menu is open
	if (navState.value.mobileNavState === "open") {
		// if the escape key is pressed
		if (event.key === "Escape") {
			// close the menu
			toggleMobileMenu();
		}

		// ** click trapping **

		// if the tab key is pressed with shift
		// focus on the brand link
		else if (event.key === "Tab" && event.shiftKey) {
			event.preventDefault();
			navState.value.brandLink?.focus();
		}

		// focus on first mobile menu item in the active menu
		else if (event.key === "Tab") {
			event.preventDefault();
			const firstItem = getFirstItemInActiveMobileMenu();
			firstItem?.focus();
		}
	}
}
const btnBaseClasses =
	"appearance-none inline-flex items-center justify-center rounded-md my-1 p-2";
const btnFocusClasses = "focus:bg-primary";
const btnFocusVisibleClasses =
	"focus-visible:outline focus-visible:outline-4 focus-visible:outline-accent focus-visible:outline-2 focus-visible:outline-neutral-100";
const btnHoverClasses = "hover:bg-primary";
</script>

	<div class="flex items-center text-neutral-100 xl:hidden">
		<button
			class="group {btnBaseClasses} {btnFocusClasses} {btnFocusVisibleClasses} {btnHoverClasses}"
			aria-expanded={ navState.value.mobileNavState === 'open' }
			onclick={ toggleMobileMenu }
			onkeydown={ handleKeydown } >

			<span class="sr-only">Open menu</span>
			<div class="pointer-events-none select-none py-1">
				<div class="border-b border-white w-8 h-0 transition-transform origin-center mb-2 {navState.value.mobileNavState === 'open' ? 'rotate-45 translate-y-1' : ''} group-hover:border-neutral-50"></div>
				<div class="border-b border-white w-8 h-0 transition-transform origin-center {navState.value.mobileNavState === 'open' ? '-rotate-45 -translate-y-1' : ''} group-hover:border-neutral-50"></div>
			</div>
		</button>
</div>
