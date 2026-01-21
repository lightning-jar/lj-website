// data
import { testimonialsContent } from "$content/getters/getTestimonialsContent";

export function load() {
	return {
		...testimonialsContent,
	};
}
