// data
import { default as content } from "$content/services.json";

const typedContent = content;

export function load() {
	return {
		...typedContent,
	};
}
