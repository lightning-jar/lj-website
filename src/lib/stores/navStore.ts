import { writable } from "svelte/store";

// import data
import { default as nav } from "$data/nav.json";

export const navDataStore = writable(nav);
export const mobileNavOpen = writable(false);
export const activeMobileMenu = writable("main");
