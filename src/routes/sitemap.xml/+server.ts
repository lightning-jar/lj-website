// src/routes/sitemap.xml/+server.ts

// Served at request time so newly published CMS articles enter the
// sitemap without a redeploy. (The old prerender-only constraint —
// varlock having no request-time resolution context on Vercel — is gone
// since the 1Password plugin migration.) Edge-cached on the CMS sitemap
// TTL.
// SvelteKit route option, read by the framework
// fallow-ignore-next-line unused-export
export const prerender = false;

// env variables
import { ENV } from "varlock/env";

// types
import type { RequestHandler } from "@sveltejs/kit";
import type { SitemapXMLFrequency, SitemapXMLPage } from "$types/Sitemap";

const productionUrl =
	ENV.VERCEL_PROJECT_PRODUCTION_URL || "www.lightningjar.com";

// get data for blog + customer stories + reading list
import { getAllBlogArticleSlugs } from "$content/getters/getBlogArticles";
import { getAllCustomerStorySlugs } from "$content/getters/getCustomerStories";
import { getAllReadingListSlugs } from "$content/getters/getReadingList";

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

const staticPages = [
	generateSiteMapXMLPage(`/archive/introduction-to-pimcore`, "monthly", 0.25), // home
	generateSiteMapXMLPage(``, "monthly", 0.25), // home
	generateSiteMapXMLPage(`/about`, "monthly", 0.25), // about page
	generateSiteMapXMLPage(`/research`, "weekly", 0.25), // research landing page
	generateSiteMapXMLPage(`/research/barkup-bench`, "weekly", 0.25), // barkup-bench research dashboard
	generateSiteMapXMLPage(`/research/barkup-bench/playbook`, "weekly", 0.25), // the builder's playbook
	generateSiteMapXMLPage(`/blog`, "monthly", 0.25), // blog landing page
	generateSiteMapXMLPage(`/fun`, "monthly", 0.25), // fun side projects page
	generateSiteMapXMLPage(`/built-with`, "monthly", 0.25), // built with
	generateSiteMapXMLPage(`/customer-stories`, "monthly", 0.25), // customer stories landing page
	generateSiteMapXMLPage(`/reading-list`, "monthly", 0.25), // reading list landing page
	generateSiteMapXMLPage(`/services`, "monthly", 0.25), // services landing page
	generateSiteMapXMLPage(`/technologies`, "monthly", 0.25), // technologies landing page
	generateSiteMapXMLPage(`/terms`, "monthly", 0.25), // terms landing page
	generateSiteMapXMLPage(`/testimonials`, "monthly", 0.25), // testimonials landing page
] as SitemapXMLPage[];

// Server endpoint to serve the sitemap
export const GET: RequestHandler = async ({ fetch }) => {
	try {
		// generate sitemap entries for blog + customer-story detail pages
		// (CMS, request-time fetch)
		const blogArticlePages = (await getAllBlogArticleSlugs(fetch)).map((slug) =>
			generateSiteMapXMLPage(`/blog/${slug}`, "monthly", 0.25),
		);
		const customerStoryPages = (await getAllCustomerStorySlugs(fetch)).map(
			(slug) =>
				generateSiteMapXMLPage(`/customer-stories/${slug}`, "monthly", 0.25),
		);
		const readingListPages = (await getAllReadingListSlugs(fetch)).map((slug) =>
			generateSiteMapXMLPage(`/reading-list/${slug}`, "monthly", 0.25),
		);
		const pages = [
			...staticPages,
			...blogArticlePages,
			...customerStoryPages,
			...readingListPages,
		] as SitemapXMLPage[];
		const sorted = pages.sort((a, b) => a.path.localeCompare(b.path));
		return new Response(generateSiteMapXML(sorted), {
			headers: {
				"cache-control": "public, s-maxage=900, stale-while-revalidate=3600",
			},
		});
	} catch (error) {
		console.error("Error generating sitemap:", error);
		return new Response("Error generating sitemap", { status: 500 });
	}
};
