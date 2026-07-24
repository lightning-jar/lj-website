import { handleErrorWithSentry, sentryHandle } from "@sentry/sveltekit";
import { sequence } from "@sveltejs/kit/hooks";
import type { Handle } from "@sveltejs/kit";
import type { Config } from "@sveltejs/adapter-vercel";

import { getBlogArticleMarkdownBySlug } from "$content/getters/getBlogArticles";
import { getCustomerStoryMarkdownBySlug } from "$content/getters/getCustomerStories";
import { getReadingListArticleBySlug } from "$content/getters/getReadingList";
import {
	agentMarkdownRouteFor,
	blogMarkdownDoc,
	markdownResponse,
	readingListMarkdownDoc,
	storyMarkdownDoc,
} from "$utils/agentMarkdown";

// adapter-vercel route config, read by the framework
// fallow-ignore-next-line unused-export
export const config: Config = {
	runtime: "nodejs24.x",
};

const BASE = "https://www.lightningjar.com";

// Markdown for agents: article pages answer `Accept: text/markdown`
// with the source markdown (Content-Type: text/markdown); browsers keep
// getting HTML. Both variants send Vary: Accept so edge caches keep
// them apart.
const markdownForAgents: Handle = async ({ event, resolve }) => {
	const isHome = event.url.pathname === "/";
	const route = agentMarkdownRouteFor(event.url.pathname);
	if (!route && !isHome) return resolve(event);

	const wantsMarkdown =
		event.request.method === "GET" &&
		(event.request.headers.get("accept") ?? "").includes("text/markdown");

	// the homepage's markdown representation is the llms.txt site index
	if (wantsMarkdown && isHome) {
		const res = await event.fetch("/llms.txt");
		if (res.ok) return markdownResponse(await res.text());
	}

	if (wantsMarkdown && route) {
		const { type, slug } = route;
		if (type === "blog") {
			const article = await getBlogArticleMarkdownBySlug(event.fetch, slug);
			if (article) {
				const fm = article.frontMatter;
				return markdownResponse(
					blogMarkdownDoc({
						title: fm.title,
						date: fm.date,
						author: fm.author,
						description: fm.description,
						tags: fm.tags,
						url: `${BASE}/blog/${slug}`,
						markdown: article.markdown,
					}),
				);
			}
		} else if (type === "customer-story") {
			const story = await getCustomerStoryMarkdownBySlug(event.fetch, slug);
			if (story) {
				const fm = story.frontMatter;
				return markdownResponse(
					storyMarkdownDoc({
						title: fm.banner?.heading ?? fm.title,
						customer: fm.customer?.name,
						excerpt: fm.excerpt,
						tags: fm.tags,
						url: `${BASE}/customer-stories/${slug}`,
						markdown: story.markdown,
					}),
				);
			}
		} else {
			const entry = await getReadingListArticleBySlug(event.fetch, slug);
			if (entry) {
				return markdownResponse(
					readingListMarkdownDoc({
						title: entry.title,
						author: entry.author?.name,
						publication: entry.source?.publicationName,
						summary: entry.summary ?? entry.excerpt,
						sourceUrl: entry.url,
						tags: entry.tags,
						url: `${BASE}/reading-list/${slug}`,
					}),
				);
			}
		}
		// unknown slug: fall through to the normal (404) handling
	}

	const response = await resolve(event);
	response.headers.append("vary", "Accept");
	return response;
};

// If you have custom handlers, make sure to place them after `sentryHandle()` in the `sequence` function.
export const handle = sequence(sentryHandle(), markdownForAgents);

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = handleErrorWithSentry();
