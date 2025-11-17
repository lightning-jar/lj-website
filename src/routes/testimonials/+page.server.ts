// data
import { default as content } from "$data/testimonials.json";

const typedContent = content;

export function load() {
	return {
		...typedContent,
	};
}
