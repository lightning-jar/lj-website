import type { Image } from "$types/Image";

export interface Article {
	author?: Author;
	comments?: string[];
	/** SEO meta description (standard CMS frontmatter field). */
	description?: string;
	excerpt: string;
	id: string;
	image?: Image;
	/** SEO meta title (standard CMS frontmatter field). */
	metaTitle?: string;
	quote: string;
	publishDate?: string;
	repostDate: string;
	slug: string;
	source: ArticleSource;
	title: string;
	url?: string;
	summary: string;
	tags: string[];
}

export interface ArticleSource {
	publicationUrl: string;
	publisherName?: string;
	publicationName: string;
}

export interface Author {
	name: string;
	email?: string;
	url?: string;
	mastodon?: string;
	github?: string;
}
