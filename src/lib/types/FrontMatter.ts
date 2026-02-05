import type { ArticleSource } from "$types/ArticleSource";

export interface FrontMatter {
	[key: string]: unknown;
	title?: string;
	metaTitle?: string;
	description?: string;
	date?: string;
	draft?: boolean;
	tags?: string[];
	image?: string;
	imageDescription?: string;
	author?: string;
	quote?: {
		text: string;
		attribution?: string;
	};
	sources?: ArticleSource[];
	glossary?: {
		term: string;
		definition: string;
	}[];
	additionalReading?: {
		title: string;
		url: string;
	}[];
}
