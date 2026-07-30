import { error } from "@sveltejs/kit";

import aeoStudies from "../aeo-studies.json";

export const prerender = true;

export function entries() {
	return aeoStudies.studies.map((s) => ({ study: s.slug }));
}

export function load({ params }) {
	const index = aeoStudies.studies.findIndex((s) => s.slug === params.study);
	if (index === -1) error(404, "Study not found");
	const study = aeoStudies.studies[index];
	const previous = aeoStudies.studies[index - 1] ?? null;
	const next = aeoStudies.studies[index + 1] ?? null;
	return {
		study,
		previous: previous && { slug: previous.slug, letters: previous.letters },
		next: next && { slug: next.slug, letters: next.letters },
		meta: {
			title: `Study ${study.letters}: ${study.title} · AEO Bench`,
			description: study.indexLine,
			robotsFollow: true,
			analyticsOn: true,
		},
	};
}
