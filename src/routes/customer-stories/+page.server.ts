// data
import { default as content } from "$data/customer-stories.json";

export function load() {
	return {
		...content,
	};
}
