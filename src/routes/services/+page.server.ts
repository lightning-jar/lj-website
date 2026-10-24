// data
import { servicesContent } from "#lib/content/getters/getServicesContent.js";

export function load() {
	return {
		...servicesContent,
	};
}
