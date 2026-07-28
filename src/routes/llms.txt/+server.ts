import { getAllBlogArticles } from "$content/getters/getBlogArticles";
import { getAllCustomerStories } from "$content/getters/getCustomerStories";
import { getAllReadingListArticles } from "$content/getters/getReadingList";
import { allPackages } from "$content/getters/getPackagesContent";
import { allTechnologies } from "$content/getters/getTechnologiesContent";

import benchStudies from "../research/barkup-bench/bench-studies.json";

import type { RequestHandler } from "./$types";

// llms.txt (llmstxt.org): a markdown index of the site for LLM agents.
// Served at request time so it always reflects the published CMS
// content; edge-cached on the sitemap TTL.
export const prerender = false;

const BASE = "https://www.lightningjar.com";

export const GET: RequestHandler = async ({ fetch }) => {
	const [articles, stories, readingList] = await Promise.all([
		getAllBlogArticles(fetch),
		getAllCustomerStories(fetch),
		getAllReadingListArticles(fetch),
	]);

	const lines: string[] = [
		"# Lightning Jar",
		"",
		"> Design, build, and brand technology studio, independent since 2001. We build websites, web applications, and custom software; publish open, pre-registered LLM research (Barkup Bench); and ship open-source libraries for LLM document editing (barkup, barkdown).",
		"",
		"Contact: hello@lightningjar.com. All site content is public; the MCP endpoint below serves it to agents in structured form.",
		"",
		"## Agents",
		"",
		`- [MCP endpoint](${BASE}/mcp): public, keyless, read-only Model Context Protocol server (streamable HTTP, stateless) with search and read tools over everything listed here`,
		`- [MCP manifest](${BASE}/.well-known/mcp.json): discovery metadata for the endpoint`,
		`- [Agent skills](${BASE}/.well-known/agent-skills/index.json): downloadable SKILL.md packages, starting with how to query Barkup Bench data`,
		`- [API catalog](${BASE}/.well-known/api-catalog): RFC 9727 linkset of machine-readable endpoints`,
		"",
		"## Company",
		"",
		`- [About](${BASE}/about): who we are, what we believe, twenty-five years of history`,
		`- [Services](${BASE}/services): what we do for clients`,
		`- [Packages & Tools](${BASE}/packages): open-source packages and tools we make`,
		`- [Technologies](${BASE}/technologies): the stack we work in`,
		`- [Customer Stories](${BASE}/customer-stories): case studies`,
		`- [Testimonials](${BASE}/testimonials)`,
		"",
		"## Research",
		"",
		`- [Barkup Bench](${BASE}/research/barkup-bench): open, pre-registered benchmark series measuring how LLMs read and edit structured document trees — results dashboard, study index, packages`,
		`- [The Builder's Playbook](${BASE}/research/barkup-bench/playbook): ten measured guidelines for building document-editing apps with LLM agents, with code examples`,
	];

	for (const s of benchStudies.studies) {
		lines.push(
			`- [Study ${s.letters}: ${s.title}](${BASE}/research/barkup-bench/${s.slug}): ${s.indexLine}`,
		);
	}

	lines.push("", "## Blog", "");
	for (const a of articles) {
		const fm = a.frontMatter;
		lines.push(
			`- [${fm.title}](${BASE}/blog/${fm.slug}): ${fm.description ?? ""}`,
		);
	}

	lines.push("", "## Customer Stories", "");
	for (const s of stories) {
		lines.push(
			`- [${s.title}](${BASE}/customer-stories/${s.slug}): ${s.excerpt}`,
		);
	}

	lines.push("", "## Reading List", "");
	for (const e of readingList) {
		lines.push(`- [${e.title}](${BASE}/reading-list/${e.slug}): ${e.excerpt}`);
	}

	lines.push("", "## Packages & Tools", "");
	for (const p of allPackages) {
		lines.push(`- [${p.name}](${BASE}/packages/${p.id}): ${p.tagline}`);
	}

	lines.push("", "## Technologies", "");
	for (const t of allTechnologies) {
		lines.push(
			`- [${t.name}](${BASE}/technologies/${t.id}): ${t.shortDescription ?? ""}`,
		);
	}

	lines.push(
		"",
		"## Feeds",
		"",
		`- [Feed index](${BASE}/feeds): all feeds, described`,
		`- [Combined feed — everything](${BASE}/atom.xml)`,
		`- [Blog feed](${BASE}/blog/atom.xml)`,
		`- [Customer Stories feed](${BASE}/customer-stories/atom.xml)`,
		`- [Reading List feed](${BASE}/reading-list/atom.xml)`,
		`- [Barkup Bench research feed](${BASE}/research/barkup-bench/atom.xml)`,
		"",
	);

	return new Response(lines.join("\n"), {
		headers: {
			"content-type": "text/plain; charset=utf-8",
			"cache-control": "public, s-maxage=900, stale-while-revalidate=3600",
		},
	});
};
