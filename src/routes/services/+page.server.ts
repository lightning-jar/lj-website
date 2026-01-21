// data
import { servicesContent } from "$content/getters/getServicesContent";

export function load() {
	return {
		...servicesContent,
	};
}
