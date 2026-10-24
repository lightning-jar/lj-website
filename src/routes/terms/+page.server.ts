// data
import { termsContent } from "#lib/content/getters/getTermsContent.js";

export function load() {
	return {
		...termsContent,
	};
}
