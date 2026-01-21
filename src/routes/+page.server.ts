// data
import { homeContent } from "$content/getters/getHomeContent";
export function load() {
	return {
		...homeContent,
	};
}
