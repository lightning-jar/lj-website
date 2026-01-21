// data
import { builtWithContent } from "$content/getters/getBuiltWithContent";

export function load() {
	return {
		...builtWithContent,
	};
}
