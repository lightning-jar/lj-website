import page from "$content/landing-pages/technologies.json";

export const technologiesContent = page;

export const technologiesSitemapSection = {
	name: "Technologies",
	pages: [
		{
			href: "/technologies",
			description: page.meta.description,
			title: page.meta.title,
			date: "",
		},
	],
};
