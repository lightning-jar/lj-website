// data
import { default as about } from "#lib/content/landing-pages/about.json";
import { default as customerStoriesLanding } from "#lib/content/landing-pages/customer-stories.json";

export function load() {
	return {
		...about,
		clients: customerStoriesLanding.clients ?? [],
	};
}
