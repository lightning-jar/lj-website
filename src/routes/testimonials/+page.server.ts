// data
import { testimonialsContent } from "#lib/content/getters/getTestimonialsContent.js";

export function load() {
	return {
		...testimonialsContent,
	};
}
