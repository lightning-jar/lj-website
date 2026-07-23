import { error } from "@sveltejs/kit";

import benchStudies from "../bench-studies.json";

export const prerender = true;

export function entries() {
	return benchStudies.studies.map((s) => ({ study: s.slug }));
}

export function load({ params }) {
	const index = benchStudies.studies.findIndex((s) => s.slug === params.study);
	if (index === -1) error(404, "Study not found");
	const study = benchStudies.studies[index];
	const previous = benchStudies.studies[index - 1] ?? null;
	const next = benchStudies.studies[index + 1] ?? null;
	return {
		study,
		previous: previous && { slug: previous.slug, letters: previous.letters },
		next: next && { slug: next.slug, letters: next.letters },
		meta: {
			title: `Study ${study.letters}: ${study.title} — barkup-bench`,
			description: study.indexLine,
			robotsFollow: true,
			analyticsOn: true,
		},
	};
}
