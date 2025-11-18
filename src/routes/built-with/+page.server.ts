// data
import { default as content } from "$data/built-with.json";

const contentTyped = content as typeof content;

export function load() {
	return {
		...contentTyped,
	};
}
