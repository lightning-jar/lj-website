// types
import type { PageServerLoadEvent } from "./$types";

// data
import { default as content } from "$data/home.json";

export async function load(event: PageServerLoadEvent) {
	// const path = event.url.pathname;

	// // is home
	// const isHome = path === "/";

	// set page metadata
	const metaDescription = `Lightning Jar is a technology studio & digital agency helping businesses thrive in a world that is more digital &amp; mobile every day`;
	const metaTitle = `Lightning Jar | Technology Studio & Digital Agency`;

	return {
		content,
		metaDescription,
		metaTitle,
	};
}
