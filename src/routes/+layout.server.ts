// prerender: true
export const prerender = true;

// store functions
import { get } from "svelte/store";

// redirect function
import { redirect } from "@sveltejs/kit";

// import types
import type { LayoutServerLoadEvent } from "./$types";
import type { NavItem } from "$types/types";

// stores
import { navDataStore } from "$stores/navStore";

// import redirects
import { redirects } from "$settings/redirects";

// load function
export async function load(event: LayoutServerLoadEvent) {
	const path = event.url.pathname;

	// redirects
	redirects.forEach((item) => {
		if (path == item[0] || path.slice(0, -1) == item[0]) {
			throw redirect(301, item[1]);
		}
	});

	// isHome
	const isHome = path === "/";

	// nav
	const nav: NavItem[] = get(navDataStore);

	return {
		isHome,
		nav,
	};
}
