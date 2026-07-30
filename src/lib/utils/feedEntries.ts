import type { BlogArticleListEntry } from "$content/getters/getBlogArticles";
import type { Article } from "$types/Article";
import type { CustomerStory } from "$types/CustomerStory";
import { type FeedEntry, str, toIso } from "$utils/atomFeed";

export function buildCustomerStoryEntries(
	baseUrl: string,
	stories: CustomerStory[],
): FeedEntry[] {
	return stories.flatMap((story) => {
		if (!story?.slug) return [];
		const url = `${baseUrl}/customer-stories/${story.slug}`;
		return [
			{
				id: url,
				title: story.banner?.heading || story.title || "",
				link: url,
				updated: toIso(story.date),
				summary: story.excerpt || "",
				authorName: "Lightning Jar",
				category: "Customer Stories",
			},
		];
	});
}

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

interface StudyFeedSource {
	letters: string;
	slug: string;
	title: string;
	indexLine: string;
	published: string;
}

// one entry per study in a research project (barkup-bench, aeo-bench);
// shared by the per-project research feeds and the combined /atom.xml
export function buildStudyEntries(
	baseUrl: string,
	studies: StudyFeedSource[],
	projectSlug = "barkup-bench",
): FeedEntry[] {
	return studies.map((s) => {
		const url = `${baseUrl}/research/${projectSlug}/${s.slug}`;
		return {
			id: url,
			title: `Study ${s.letters}: ${s.title}`,
			link: url,
			updated: toIso(s.published),
			summary: s.indexLine,
			authorName: "Lightning Jar",
			category: "Research",
		};
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
