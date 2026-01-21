import home from "$content/landing-pages/home.json";

export const homeContent = home;

export const homeSitemapSection = {
	name: "Home",
	pages: [
		{
			href: "/",
			description: home.meta.description,
			title: home.meta.title,
			date: "",
		},
	],
};
