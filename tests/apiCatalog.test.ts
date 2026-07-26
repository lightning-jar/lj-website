import { describe, expect, test } from "bun:test";

import {
	API_CATALOG,
	API_CATALOG_CONTENT_TYPE,
	API_CATALOG_ITEMS,
	BASE,
} from "../src/lib/utils/apiCatalog";

// Pins the RFC 9727 shape of the api-catalog so it cannot silently
// regress: the A.2 self-anchored entry must enumerate every member via
// `item`, and the A.1 descriptive entries must survive alongside it.

const EXPECTED_ITEM_HREFS = [
	`${BASE}/mcp`,
	`${BASE}/llms.txt`,
	`${BASE}/search-index.json`,
	`${BASE}/sitemap.xml`,
	`${BASE}/atom.xml`,
	`${BASE}/blog/atom.xml`,
	`${BASE}/customer-stories/atom.xml`,
	`${BASE}/reading-list/atom.xml`,
	`${BASE}/research/barkup-bench/atom.xml`,
	`${BASE}/.well-known/mcp.json`,
	`${BASE}/.well-known/mcp/server-card.json`,
	`${BASE}/.well-known/agent-skills/index.json`,
];

describe("api-catalog (RFC 9727)", () => {
	test("media type carries the RFC 9727 profile parameter (§4.2)", () => {
		expect(API_CATALOG_CONTENT_TYPE).toStartWith("application/linkset+json");
		expect(API_CATALOG_CONTENT_TYPE).toContain(
			'profile="https://www.rfc-editor.org/info/rfc9727"',
		);
	});

	test("self-anchored entry enumerates every member via `item` (Appendix A.2)", () => {
		const selfEntry = API_CATALOG.linkset.find(
			(entry) => entry.anchor === `${BASE}/.well-known/api-catalog`,
		);
		expect(selfEntry).toBeDefined();
		const items = (selfEntry as { item?: { href: string; type?: string }[] })
			.item;
		expect(items).toBeDefined();
		expect(items?.map((i) => i.href)).toEqual(EXPECTED_ITEM_HREFS);
		// exact count so a silently shrinking catalog fails loudly
		expect(items).toHaveLength(12);
		for (const item of items ?? []) {
			expect(item.href).toStartWith("https://www.lightningjar.com/");
			expect(item.type).toBeTruthy();
		}
	});

	test("exported items and catalog entry stay in sync", () => {
		expect(API_CATALOG_ITEMS.map((i): string => i.href)).toEqual(
			EXPECTED_ITEM_HREFS,
		);
	});

	test("descriptive per-API entries survive alongside (Appendix A.1)", () => {
		const anchors = API_CATALOG.linkset.map((entry) => entry.anchor);
		expect(anchors).toContain(`${BASE}/mcp`);
		expect(anchors).toContain(`${BASE}/search-index.json`);
		expect(anchors).toContain(`${BASE}/sitemap.xml`);
		const mcpEntry = API_CATALOG.linkset.find(
			(entry) => entry.anchor === `${BASE}/mcp`,
		) as Record<string, unknown>;
		expect(mcpEntry["service-desc"]).toBeDefined();
		expect(mcpEntry["service-doc"]).toBeDefined();
	});
});
