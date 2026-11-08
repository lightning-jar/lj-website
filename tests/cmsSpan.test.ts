import { describe, expect, it } from "vitest";

import { cmsSpanInfo } from "#lib/content/getters/cmsSpan.js";

const base = "https://replicator.lj.dev";

describe("cmsSpanInfo", () => {
	it("distinguishes the three homepage list fetches", () => {
		const urls = [
			`${base}/api/public/blog/articles?collection=customer-story&limit=200`,
			`${base}/api/public/blog/articles?limit=200`,
			`${base}/api/public/blog/articles?collection=reading-list&limit=200`,
		];
		const infos = urls.map(cmsSpanInfo);
		expect(infos.map((i) => i.name)).toEqual([
			"cms list customer-story",
			"cms list blog",
			"cms list reading-list",
		]);
		expect(new Set(infos.map((i) => i.attributes["cms.collection"])).size).toBe(
			3,
		);
		expect(infos[1].attributes).toEqual({
			"cms.path": "/api/public/blog/articles",
			"cms.collection": "blog",
			"cms.limit": 200,
		});
	});

	it("names single-article fetches with collection and slug", () => {
		const info = cmsSpanInfo(
			`${base}/api/public/blog/articles/hello%20world?collection=findings`,
		);
		expect(info.name).toBe("cms article findings");
		expect(info.attributes["cms.slug"]).toBe("hello world");
	});

	it("falls back for other paths and bad URLs", () => {
		expect(cmsSpanInfo(`${base}/api/public/blog/authors`).name).toBe(
			"cms fetch /api/public/blog/authors",
		);
		expect(cmsSpanInfo("not a url")).toEqual({
			name: "cms fetch",
			attributes: {},
		});
	});
});
