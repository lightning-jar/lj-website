import { error } from "@sveltejs/kit";

import { getFindingBySlug } from "$content/getters/getFindings";

// Rendered at request time so CMS saves go live without a redeploy —
// including brand-new slugs; Vercel's edge caches responses on the same
// TTLs as the CMS API.
export const prerender = false;

export async function load({ params, fetch, setHeaders }) {
	setHeaders({
		"cache-control": "public, s-maxage=300, stale-while-revalidate=3600",
	});

	const finding = await getFindingBySlug(fetch, params.slug);

	if (!finding) {
		return error(404, "Finding not found");
	}

	const fm = finding.frontMatter;
	return {
		finding,
		meta: {
			title:
				fm.metaTitle ||
				(fm.number ? `Findings No. ${fm.number}: ${fm.title}` : fm.title),
			description: fm.description || "",
		},
	};
}
