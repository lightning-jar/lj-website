// data
import { default as content } from "$data/terms.json";

const contentTyped = content as typeof content;

export function load() {
	return {
		...contentTyped,
	};
}
