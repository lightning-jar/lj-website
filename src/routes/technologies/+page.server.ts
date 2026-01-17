// data
import { default as content } from "$content/technologies.json";

const contentTyped = content as typeof content;

export function load() {
	return {
		...contentTyped,
	};
}
