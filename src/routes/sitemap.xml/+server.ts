// src/routes/sitemap.xml/+server.ts

// env variables
import { VERCEL_PROJECT_PRODUCTION_URL } from "$env/static/private";

// types
import type { RequestHandler } from "@sveltejs/kit";
import type { SitemapXMLFrequency, SitemapXMLPage } from "$types/Sitemap";

// const isProduction = VERCEL_ENV === "production";
const productionUrl = VERCEL_PROJECT_PRODUCTION_URL
	? VERCEL_PROJECT_PRODUCTION_URL
	: "www.lightningjar.com";

// get data for blog
import { allBlogArticleSlugs } from "$content/getters/getBlogArticles";
import { allCustomerStorySlugs } from "$content/getters/getCustomerStories";

// helper function to create sitemap pages
function generateSiteMapXMLPage(
	path: string,
	changefreq: SitemapXMLFrequency,
	priority: number,
): SitemapXMLPage {
	return { path, changefreq, priority };
}

function formatDate(date: Date): string {
	return date.toISOString().split("T")[0];
}

function generateSiteMapXML(pages: SitemapXMLPage[]): string {
	// set base url
	const baseUrl = `https://${productionUrl}`;

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${pages
				.map(
					(page) => `
        <url>
          <loc>${baseUrl}${page.path}</loc>
          <lastmod>${formatDate(new Date())}</lastmod>
          <changefreq>${page.changefreq}</changefreq>
          <priority>${page.priority}</priority>
        </url>`,
				)
				.join("")}
    </urlset>`;

	return xml;
}

// generate sitemap entries for blog detail pages
const blogArticlePages = allBlogArticleSlugs.map((slug) => {
	if (!slug) return [];
	return generateSiteMapXMLPage(`/blog/${slug}`, "monthly", 0.25);
});

// generate sitemap entries for customer stories detail pages
const customerStoryPages = allCustomerStorySlugs.map((slug) => {
	if (!slug) return [];
	return generateSiteMapXMLPage(`/customer-stories/${slug}`, "monthly", 0.25);
});

//

const pages = [
	generateSiteMapXMLPage(`/archive/introduction-to-pimcore`, "monthly", 0.25), // home
	generateSiteMapXMLPage(``, "monthly", 0.25), // home
	generateSiteMapXMLPage(`/blog`, "monthly", 0.25), // blog landing page
	generateSiteMapXMLPage(`/built-with`, "monthly", 0.25), // built with
	generateSiteMapXMLPage(`/customer-stories`, "monthly", 0.25), // customer stories landing page
	generateSiteMapXMLPage(`/services`, "monthly", 0.25), // services landing page
	generateSiteMapXMLPage(`/technologies`, "monthly", 0.25), // technologies landing page
	generateSiteMapXMLPage(`/terms`, "monthly", 0.25), // terms landing page
	generateSiteMapXMLPage(`/testimonials`, "monthly", 0.25), // testimonials landing page
	...blogArticlePages,
	...customerStoryPages,
] as SitemapXMLPage[];
const sorted = pages.sort((a, b) => a.path.localeCompare(b.path));

const sitemap = generateSiteMapXML(sorted);

// Server endpoint to serve the sitemap
export const GET: RequestHandler = async () => {
	try {
		return new Response(sitemap);
	} catch (error) {
		console.error("Error generating sitemap:", error);
		return new Response("Error generating sitemap", { status: 500 });
	}
};
