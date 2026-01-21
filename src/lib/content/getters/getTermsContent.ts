import page from "$content/landing-pages/terms.json";

export const termsContent = page;

export const termsSitemapSection = {
	name: "Terms",
	pages: [
		{
			href: "/terms",
			description: page.meta.description,
			title: page.meta.title,
			date: "",
		},
	],
};
