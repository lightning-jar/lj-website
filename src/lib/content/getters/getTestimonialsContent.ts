import page from "$content/landing-pages/testimonials.json";

export const testimonialsContent = page;

export const testimonialsSitemapSection = {
	name: "Testimonials",
	pages: [
		{
			href: "/testimonials",
			description: page.meta.description,
			title: page.meta.title,
			date: "",
		},
	],
};
