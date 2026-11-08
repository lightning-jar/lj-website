// @vitest-environment happy-dom

import { describe, expect, it, vi } from "vitest";
import {
	failedChunkUrl,
	handlePreloadError,
	isRootErrorNode,
	type PreloadErrorEvent,
} from "../src/lib/utils/chunkLoadRecovery";

function preloadErrorEvent(payload: unknown): PreloadErrorEvent {
	const e = new Event("vite:preloadError", {
		cancelable: true,
	}) as PreloadErrorEvent;
	e.payload = payload;
	return e;
}

const ROOT_ERR = new TypeError(
	"Failed to fetch dynamically imported module: https://www.lightningjar.com/_app/immutable/nodes/1.BpJxFOex.js",
);

describe("failedChunkUrl", () => {
	it("extracts the chunk URL from the error message", () => {
		expect(failedChunkUrl(ROOT_ERR)).toBe(
			"https://www.lightningjar.com/_app/immutable/nodes/1.BpJxFOex.js",
		);
	});

	it("returns undefined for non-errors", () => {
		expect(failedChunkUrl(undefined)).toBeUndefined();
		expect(failedChunkUrl({})).toBeUndefined();
	});
});

describe("isRootErrorNode", () => {
	it("matches only node 1", () => {
		expect(isRootErrorNode("/_app/immutable/nodes/1.BpJxFOex.js")).toBe(true);
		expect(isRootErrorNode("/_app/immutable/nodes/10.abc.js")).toBe(false);
		expect(isRootErrorNode("/_app/immutable/nodes/23.DSaOZRR9.js")).toBe(false);
		expect(isRootErrorNode("/_app/immutable/chunks/1.abc.js")).toBe(false);
		expect(isRootErrorNode(undefined)).toBe(false);
	});
});

describe("handlePreloadError", () => {
	it("recovers the root error node and reports it as a handled warning", () => {
		const capture = vi.fn();
		const e = preloadErrorEvent(ROOT_ERR);

		expect(handlePreloadError(e, capture)).toBe(true);
		expect(e.defaultPrevented).toBe(true);
		expect(capture).toHaveBeenCalledWith(ROOT_ERR, {
			level: "warning",
			tags: {
				chunk_url:
					"https://www.lightningjar.com/_app/immutable/nodes/1.BpJxFOex.js",
				chunk_recovered: "true",
			},
		});
	});

	it("leaves other chunk failures untouched", () => {
		const capture = vi.fn();
		const e = preloadErrorEvent(
			new TypeError(
				"Failed to fetch dynamically imported module: https://www.lightningjar.com/_app/immutable/nodes/23.DSaOZRR9.js",
			),
		);

		expect(handlePreloadError(e, capture)).toBe(false);
		expect(e.defaultPrevented).toBe(false);
		expect(capture).not.toHaveBeenCalled();
	});
});
