// data
import {
	allTechnologies,
	allTechnologySupercategories,
	technologiesLandingPageContent,
} from "$content/getters/getTechnologiesContent";

export function load() {
	return {
		technologies: allTechnologies,
		supercategories: allTechnologySupercategories,
		...technologiesLandingPageContent,
	};
}
