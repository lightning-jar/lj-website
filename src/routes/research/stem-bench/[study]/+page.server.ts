import { error } from "@sveltejs/kit";

import stemStudies from "../stem-studies.json";

export const prerender = true;

export function entries() {
	return stemStudies.studies.map((s) => ({ study: s.slug }));
}

export function load({ params }) {
	const index = stemStudies.studies.findIndex((s) => s.slug === params.study);
	if (index === -1) error(404, "Study not found");
	const study = stemStudies.studies[index];
	const previous = stemStudies.studies[index - 1] ?? null;
	const next = stemStudies.studies[index + 1] ?? null;
	return {
		study,
		previous: previous && { slug: previous.slug, letters: previous.letters },
		next: next && { slug: next.slug, letters: next.letters },
		meta: {
			title: `Study ${study.letters}: ${study.title} · Stem Bench`,
			description: study.indexLine,
			robotsFollow: true,
			analyticsOn: true,
		},
	};
}
