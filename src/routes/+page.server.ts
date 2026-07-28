// data
import { homeContent } from "$content/getters/getHomeContent";
import { getAllBlogArticles } from "$content/getters/getBlogArticles";
import { getAllCustomerStories } from "$content/getters/getCustomerStories";
import { getAllReadingListArticles } from "$content/getters/getReadingList";
import benchStudies from "./research/barkup-bench/bench-studies.json";

// Request-time (not prerendered): the Latest tiles stay current with
// the CMS between deploys, and hooks.server.ts can answer
// `Accept: text/markdown` on `/` for agents. Edge-cached like the
// other request-time surfaces.
export const prerender = false;

export async function load({ fetch, setHeaders }) {
	setHeaders({
		"cache-control": "public, s-maxage=300, stale-while-revalidate=3600",
	});

	const [allStories, allArticles, allReading] = await Promise.all([
		getAllCustomerStories(fetch),
		getAllBlogArticles(fetch),
		getAllReadingListArticles(fetch),
	]);

	// latest customer stories for the homepage grid (curated order, capped
	// at 6; the getter is already order-sorted)
	const latestStories = allStories.slice(0, 6).map((story) => ({
		slug: story.slug ?? "",
		title: story.banner?.heading ?? "",
		image: story.thumbnailImage?.src ?? "",
	}));

	// latest blog articles for the homepage grid (newest first, capped at 6)
	const latestArticles = allArticles.slice(0, 6).map((article) => ({
		slug:
			typeof article.frontMatter?.slug === "string"
				? article.frontMatter.slug
				: "",
		title:
			typeof article.frontMatter?.title === "string"
				? article.frontMatter.title
				: "",
		image:
			typeof article.frontMatter?.image === "string"
				? article.frontMatter.image
				: "",
	}));

	// latest studies for the homepage tiles (file is chronological; newest
	// last, so reverse and cap at 6)
	const latestStudies = benchStudies.studies
		.slice(-6)
		.reverse()
		.map((study) => ({
			slug: study.slug,
			letters: study.letters,
			title: study.title,
		}));

	// latest reading-list entries for the homepage tiles (getter is
	// repostDate-sorted newest first, capped at 6); tiles link our
	// detail pages, which carry the summary and the outbound link
	const latestReading = allReading.slice(0, 6).map((entry) => ({
		slug: entry.slug,
		title: entry.title,
		publication: entry.source?.publicationName ?? "",
	}));

	// ticker withheld while hidden; restore by returning ...homeContent
	const { ticker, ...contentWithoutTicker } = homeContent;
	return {
		...contentWithoutTicker,
		latestArticles,
		latestReading,
		latestStories,
		latestStudies,
	};
}
