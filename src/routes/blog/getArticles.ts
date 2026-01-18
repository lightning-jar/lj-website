// utils
import { parseMarkdown } from "$utils/parseMarkdown";

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
	const articles = rawArticles.map((article) => {
		return parseMarkdown(article);
	});
	return articles;
}

export const allBlogArticles = await getArticles();
export const allBlogArticleSlugs = allBlogArticles
	.map((article) => article.frontMatter?.slug || "")
	.filter(Boolean);
