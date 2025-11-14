// data
import { default as content } from "$data/terms.json";

export async function load() {
	return {
		...content,
	};
}
