// utils
import { parseMarkdown } from "$utils/parseMarkdown";

// types
import type { PageMeta } from "$types/PageMeta";

import { default as article } from "$content/blog/migrating-away-from-wordpress.md?raw";

export function load() {
	// console.log(getFrontMatter(article));
	const { frontMatter, html } = parseMarkdown(article);
	console.log(html);

	const meta: PageMeta = {
		title: frontMatter?.metaTitle ?? "",
		description: frontMatter?.description ?? "",
		author: frontMatter.author,
		date: frontMatter.date,
		tags: frontMatter.tags,
	};

	return {
		meta,
		date: frontMatter?.date ?? "",
		title: frontMatter?.title ?? "",
		html,
	};
}
