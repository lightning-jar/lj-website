import { describe, expect, test } from "bun:test";

import type { SearchRecord } from "../src/lib/utils/siteSearch";
import { buildWebMcpTools } from "../src/lib/utils/webMcp";

const records: SearchRecord[] = [
	{
		type: "study",
		title: "Study AO: Canonical-tag steering",
		blurb: "Tag drift is structural.",
		tags: ["Agent-surface steering"],
		url: "/research/barkup-bench/ao",
	},
	{
		type: "blog",
		title: "Leaving WordPress",
		blurb: "Why we left.",
		tags: ["CMS"],
		url: "/blog/leaving-wordpress",
	},
];

function makeTools(navigated: string[] = []) {
	return buildWebMcpTools({
		loadIndex: async () => records,
		navigate: (path) => navigated.push(path),
	});
}

describe("buildWebMcpTools", () => {
	test("exposes three well-formed tools", () => {
		const tools = makeTools();
		expect(tools.map((t) => t.name)).toEqual([
			"search_site",
			"open_page",
			"get_agent_resources",
		]);
		for (const tool of tools) {
			expect(tool.description.length).toBeGreaterThan(20);
			expect(tool.inputSchema).toHaveProperty("type", "object");
			expect(typeof tool.execute).toBe("function");
		}
	});

	test("search_site filters the index and returns urls", async () => {
		const [search] = makeTools();
		const result = await search.execute({ query: "steering" });
		const parsed = JSON.parse(result.content[0].text);
		expect(parsed.total).toBe(1);
		expect(parsed.results[0].url).toBe("/research/barkup-bench/ao");
	});

	test("open_page navigates root-relative paths only", async () => {
		const navigated: string[] = [];
		const [, openPage] = makeTools(navigated);
		await openPage.execute({ path: "/blog" });
		expect(navigated).toEqual(["/blog"]);

		const refusedExternal = await openPage.execute({
			path: "https://evil.example",
		});
		const refusedSchemeRelative = await openPage.execute({
			path: "//evil.example",
		});
		expect(refusedExternal.content[0].text).toContain("Refused");
		expect(refusedSchemeRelative.content[0].text).toContain("Refused");
		expect(navigated).toEqual(["/blog"]);
	});

	test("get_agent_resources points at the server-side MCP endpoint", async () => {
		const [, , resources] = makeTools();
		const result = await resources.execute({});
		expect(result.content[0].text).toContain(
			"https://www.lightningjar.com/mcp",
		);
		expect(result.content[0].text).toContain("agent-skills/index.json");
	});
});
