// import { default as content } from "$content/customer-stories.json";
//
// types
import type { Article } from "$types/Article";
import type { SitemapSection } from "$types/Sitemap";

async function loadAllReadingListJson() {
	const modules: Record<string, { default: Article }> = import.meta.glob(
		"/src/lib/content/reading-list/**/*.json",
		{
			eager: true, // import immediately (synchronous result)
		},
	);

	// modules is an object: { '/src/content/a.txt': '...', '/src/content/sub/b.txt': '...' }
	return Object.entries(modules).map(
		([_path, contents]) => contents?.default || "",
	);
}

export const allReadingListArticles: Article[] =
	await loadAllReadingListJson().then((articles) =>
		articles.sort((a, b) => {
			if (!a.repostDate || !b.repostDate) return 0;
			return b.repostDate.localeCompare(a.repostDate);
		}),
	);

// for human readable sitemap
function buildHumanSitemapSection() {
	// const _pages: SitemapPage[] = allReadingListArticles.map((a) => {
	// 	return {
	// 		title: a.title || "",
	// 		description: a.summary || "",
	// 		date: "",
	// 		href: `/reading-list/${a.slug}` || "",
	// 	};
	// });
	const landing = {
		title: "Reading List",
		description: "Things we read and recommend.",
		date: "",
		href: "/reading-list",
	};
	const section: SitemapSection = {
		name: "Reading List",
		// pages: [landing, ...pages],
		pages: [landing],
	};
	return section;
}

export const readingListSitemapSection = buildHumanSitemapSection();
