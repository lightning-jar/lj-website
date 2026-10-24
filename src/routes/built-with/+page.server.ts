// data
import { builtWithContent } from "#lib/content/getters/getBuiltWithContent.js";

export function load() {
	return {
		...builtWithContent,
	};
}
