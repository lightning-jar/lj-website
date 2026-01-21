// data
import { technologiesContent } from "$content/getters/getTechnologiesContent";

export function load() {
	return {
		...technologiesContent,
	};
}
