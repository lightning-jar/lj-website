// Concierge chat prototype. Now deliberately surfaced (footer link +
// both sitemaps) as a pre-homepage soft launch, partly to see how the
// abuse defenses hold up under real bot/crawler traffic — so it's
// indexable (robotsFollow: true) to keep the sitemap signal coherent.
export const prerender = false;

export function load() {
	return {
		meta: {
			title: "Concierge (experiment)",
			description:
				"An experimental chat guide to Lightning Jar's work, research, and writing.",
			robotsFollow: true,
			analyticsOn: true,
		},
	};
}
