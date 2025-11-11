// prerender: true
export const prerender = true;

// store functions
// import { get } from "svelte/store";

// import types
import type { LayoutServerLoadEvent } from "./$types";
// import type { NavItem } from "$types/types";

// // stores
// import { navDataStore } from "$stores/navStore";

// load function
export async function load(event: LayoutServerLoadEvent) {
	const path = event.url.pathname;


	// isHome
	const isHome = path === "/";

	// nav
	// const nav: NavItem[] = get(navDataStore);

	return {
		isHome,
		nav: [],
	};
}
