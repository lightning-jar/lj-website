import type { BlogArticleListEntry } from "$content/getters/getBlogArticles";
import type { Article } from "$types/Article";
import { type FeedEntry, str, toIso } from "$utils/atomFeed";

export function buildBlogEntries(
	baseUrl: string,
	allBlogArticles: BlogArticleListEntry[],
): FeedEntry[] {
	return allBlogArticles.flatMap((a) => {
		const fm = a.frontMatter ?? {};
		const slug = str(fm.slug);
		if (!slug) return [];
		const url = `${baseUrl}/blog/${slug}`;
		return [
			{
				id: url,
				title: str(fm.metaTitle) || str(fm.title),
				link: url,
				updated: toIso(str(fm.date)),
				summary: str(fm.description),
				authorName: str(fm.author) || "Lightning Jar",
				category: "Blog",
			},
		];
	});
}

export function buildReadingListEntries(
	baseUrl: string,
	allReadingListArticles: Article[],
): FeedEntry[] {
	return allReadingListArticles.flatMap((a) => {
		if (!a?.slug) return [];
		return [
			{
				id: `tag:lightningjar.com,2026:reading-list:${a.slug}`,
				link: `${baseUrl}/reading-list/${a.slug}`,
				title: a.title || "",
				updated: toIso(a.repostDate || a.publishDate),
				summary: a.summary || a.excerpt || "",
				authorName:
					a.author?.name || a.source?.publicationName || "Lightning Jar",
				category: "Reading List",
			},
		];
	});
}
