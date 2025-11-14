// data
import home from "$data/home.json";

export async function load() {
	// const path = event.url.pathname;

	// // is home
	// const isHome = path === "/";

	// set page metadata
	const meta = {
		description: `Lightning Jar is a digital design and build studio hand crafting websites and custom applications for businesses and organizations.`,
		title: `Lightning Jar | Web Studio | Since 2002`,
	};

	return {
		...home,
		meta,
	};
}
