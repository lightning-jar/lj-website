// Ask Eljay, our AI assistant (formerly /concierge — 301 in vercel.ts):
// the full-page chat experience, also embedded on the homepage via
// ConciergeLauncher. Indexable and listed in both sitemaps.
export const prerender = false;

export function load() {
	return {
		meta: {
			title: "Ask Eljay | Lightning Jar LLM Agent",
			description:
				"An experimental chat guide to Lightning Jar's work, research, and writing.",
			robotsFollow: true,
			analyticsOn: true,
		},
	};
}
