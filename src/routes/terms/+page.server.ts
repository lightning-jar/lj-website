// data
import { termsContent } from "$content/getters/getTermsContent";

export function load() {
	return {
		...termsContent,
	};
}
