import page from "#lib/content/landing-pages/built-with.json";

export const builtWithContent = page;

export const builtWithSitemapSection = {
	name: page.heading,
	pages: [
		{
			href: "/built-with",
			description: page.meta.description,
			title: page.meta.title,
			date: "",
		},
	],
};
