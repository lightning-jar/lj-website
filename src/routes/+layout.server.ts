// prerender: true
export const prerender = true;

// footer content
import { default as footer } from "$data/footer.json";

// load function
export async function load({ url }) {
	return {
		footer,
		isHome: url.pathname === "/",
		nav: [],
	};
}
