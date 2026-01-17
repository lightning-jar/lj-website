// data
import { default as content } from "$content/customer-stories.json";

export function load() {
	return {
		...content,
	};
}
