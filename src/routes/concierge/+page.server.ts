// Concierge chat prototype: unlinked and noindexed while we decide
// whether it earns a place on the homepage. robotsFollow: false makes
// the layout emit the noindex robots meta.
export const prerender = false;

export function load() {
	return {
		meta: {
			title: "Concierge (experiment)",
			description:
				"An experimental chat guide to Lightning Jar's work, research, and writing.",
			robotsFollow: false,
			analyticsOn: true,
		},
	};
}
