// data
import { default as content } from "$data/services.json";

const typedContent = content;

export function load() {
	return {
		...typedContent,
	};
}
