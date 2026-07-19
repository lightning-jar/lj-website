import { describe, expect, test } from "bun:test";

import { safeLinkUrl } from "$utils/safeLinkUrl";

describe("safeLinkUrl", () => {
	test("allows https URLs", () => {
		expect(safeLinkUrl("https://example.com/a")).toBe("https://example.com/a");
	});

	test("allows http URLs", () => {
		expect(safeLinkUrl("http://example.com")).toBe("http://example.com");
	});

	test("allows root-relative paths", () => {
		expect(safeLinkUrl("/blog/some-post")).toBe("/blog/some-post");
	});

	test("rejects protocol-relative URLs", () => {
		expect(safeLinkUrl("//evil.example")).toBe("");
	});

	test("rejects javascript: URIs", () => {
		expect(safeLinkUrl("javascript:alert(1)")).toBe("");
	});

	test("rejects javascript: URIs with leading whitespace", () => {
		expect(safeLinkUrl("  javascript:alert(1)")).toBe("");
	});

	test("rejects data: URIs", () => {
		expect(safeLinkUrl("data:text/html,<script>alert(1)</script>")).toBe("");
	});

	test("rejects vbscript: URIs", () => {
		expect(safeLinkUrl("vbscript:msgbox(1)")).toBe("");
	});

	test("rejects non-strings", () => {
		expect(safeLinkUrl(undefined)).toBe("");
		expect(safeLinkUrl(null)).toBe("");
		expect(safeLinkUrl(42)).toBe("");
	});
});
