// data
import { default as content } from "$content/testimonials.json";

const typedContent = content;

export function load() {
	return {
		...typedContent,
	};
}
