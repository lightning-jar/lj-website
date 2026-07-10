// utils
import { getFrontMatter, parseMarkdownTextToHtml } from "$utils/parseMarkdown";

// types
import type { SitemapPage, SitemapSection } from "$types/Sitemap";

// function get all raw text from blog articles
async function loadAllText() {
	const modules: Record<string, { default: string }> = import.meta.glob(
		"/src/lib/content/blog/**/*.md",
		{
			query: "?raw", // get file contents as string
			eager: true, // import immediately (synchronous result)
		},
	);

	// modules is an object: { '/src/content/a.txt': '...', '/src/content/sub/b.txt': '...' }
	return Object.entries(modules).map(
		([_path, contents]) => contents?.default || "",
	);
}

async function getArticles() {
	const rawArticles = await loadAllText();
	const articles = rawArticles
		.map((article) => ({
			frontMatter: getFrontMatter(article),
			html: parseMarkdownTextToHtml({
				markdown: article,
				options: { sanitize: true, lazyImages: true },
			}),
		}))
		.filter((article) => article.frontMatter?.draft !== true);
	return articles.sort((a, b) => {
		const dateA = new Date(
			a.frontMatter?.date && typeof a.frontMatter.date === "string"
				? a.frontMatter.date
				: "",
		);
		const dateB = new Date(
			b.frontMatter?.date && typeof b.frontMatter.date === "string"
				? b.frontMatter.date
				: "",
		);
		return dateB.getTime() - dateA.getTime();
	});
}

// get array of blog articles html & frontMatter
export const allBlogArticles = await getArticles();

// get array of article slugs
export const allBlogArticleSlugs = allBlogArticles
	.map((article) => article.frontMatter?.slug || "")
	.filter(Boolean);

export const allBlogArticlesSitemapMeta = allBlogArticles.map((article) => {
	return {
		title: article.frontMatter?.metaTitle || "",
		description: article.frontMatter?.description || "",
		date: article.frontMatter?.date || "",
		href: article.frontMatter?.slug ? `/blog/${article.frontMatter.slug}` : "",
	};
});

// for human readable sitemap
function buildHumanSitemapSection() {
	const pages: SitemapPage[] = allBlogArticles.map((article) => {
		return {
			title:
				article.frontMatter?.metaTitle &&
				typeof article.frontMatter.metaTitle === "string"
					? article.frontMatter.metaTitle
					: "",
			description:
				article.frontMatter?.description &&
				typeof article.frontMatter.description === "string"
					? article.frontMatter.description
					: "",
			date:
				article.frontMatter?.date &&
				typeof article.frontMatter.date === "string"
					? article.frontMatter.date
					: "",
			href:
				article.frontMatter?.slug &&
				typeof article.frontMatter.slug === "string"
					? `/blog/${article.frontMatter.slug}`
					: "",
		};
	});
	const landing = {
		title: "Blog",
		description: "Read our latest blog posts",
		date: new Date().toISOString(),
		href: "/blog",
	};
	const section: SitemapSection = {
		name: "Blog",
		pages: [landing, ...pages],
	};
	return section;
}

export const blogArticlesSitemapSection = buildHumanSitemapSection();
