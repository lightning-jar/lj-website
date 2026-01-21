import page from "$content/landing-pages/services.json";

export const servicesContent = page;

export const servicesSitemapSection = {
	name: "Services",
	pages: [
		{
			href: "/services",
			description: page.meta.description,
			title: page.meta.title,
			date: "",
		},
	],
};
