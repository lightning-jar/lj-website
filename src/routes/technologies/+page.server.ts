// data
import {
	allTechnologies,
	allTechnologySupercategories,
	technologiesLandingPageContent,
} from "#lib/content/getters/getTechnologiesContent.js";

export function load() {
	return {
		technologies: allTechnologies,
		supercategories: allTechnologySupercategories,
		...technologiesLandingPageContent,
	};
}
