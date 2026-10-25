import { describe, expect, test } from "vitest";
import {
	assessDeployFreshness,
	DEPLOY_GRACE_MINUTES,
	parseLiveSha,
} from "../src/lib/utils/deployFreshness";

const NOW = new Date("2026-10-24T20:00:00Z");
const A = "a".repeat(40);
const B = "b".repeat(40);
const minutesAgo = (m: number) => new Date(NOW.getTime() - m * 60_000);

describe("assessDeployFreshness", () => {
	test("matching shas are current and never failing", () => {
		const r = assessDeployFreshness({
			expectedCommittedAt: minutesAgo(600),
			expectedSha: A,
			liveSha: A,
			now: NOW,
		});
		expect(r.status).toBe("current");
		expect(r.failing).toBe(false);
		expect(r.detail).toContain("aaaaaaa");
	});

	test("a fresh divergence is 'deploying' and does NOT fail the smoke", () => {
		const r = assessDeployFreshness({
			expectedCommittedAt: minutesAgo(3),
			expectedSha: B,
			liveSha: A,
			now: NOW,
		});
		expect(r.status).toBe("deploying");
		expect(r.failing).toBe(false);
		expect(r.detail).toContain("3m ago");
	});

	test("divergence past the grace window is stale AND failing", () => {
		const r = assessDeployFreshness({
			expectedCommittedAt: minutesAgo(DEPLOY_GRACE_MINUTES + 5),
			expectedSha: B,
			liveSha: A,
			now: NOW,
		});
		expect(r.status).toBe("stale");
		expect(r.failing).toBe(true);
		// The alert must name both shas and point at the likely cause.
		expect(r.detail).toContain("aaaaaaa");
		expect(r.detail).toContain("bbbbbbb");
		expect(r.detail).toMatch(/Vercel/i);
	});

	test("the grace boundary is exclusive — exactly at the window is stale", () => {
		const at = assessDeployFreshness({
			expectedCommittedAt: minutesAgo(DEPLOY_GRACE_MINUTES),
			expectedSha: B,
			liveSha: A,
			now: NOW,
		});
		expect(at.failing).toBe(true);
		const just_under = assessDeployFreshness({
			expectedCommittedAt: minutesAgo(DEPLOY_GRACE_MINUTES - 1),
			expectedSha: B,
			liveSha: A,
			now: NOW,
		});
		expect(just_under.failing).toBe(false);
	});

	test("a long-stale deploy is reported in hours", () => {
		const r = assessDeployFreshness({
			expectedCommittedAt: minutesAgo(300),
			expectedSha: B,
			liveSha: A,
			now: NOW,
		});
		expect(r.detail).toContain("5h old");
		expect(r.failing).toBe(true);
	});

	test("divergence with an unknown commit age still fails (no free pass)", () => {
		const r = assessDeployFreshness({
			expectedCommittedAt: null,
			expectedSha: B,
			liveSha: A,
			now: NOW,
		});
		expect(r.status).toBe("stale");
		expect(r.failing).toBe(true);
		expect(r.detail).toContain("age unknown");
	});

	test("a broken probe is 'unknown' and never fails the smoke", () => {
		for (const [live, expected] of [
			[null, B],
			[A, null],
			[null, null],
		] as const) {
			const r = assessDeployFreshness({
				expectedCommittedAt: minutesAgo(600),
				expectedSha: expected,
				liveSha: live,
				now: NOW,
			});
			expect(r.status).toBe("unknown");
			expect(r.failing).toBe(false);
		}
	});

	test("the unknown verdict names which side was missing", () => {
		expect(
			assessDeployFreshness({
				expectedCommittedAt: null,
				expectedSha: B,
				liveSha: null,
				now: NOW,
			}).detail,
		).toContain("live release marker");
		expect(
			assessDeployFreshness({
				expectedCommittedAt: null,
				expectedSha: null,
				liveSha: A,
				now: NOW,
			}).detail,
		).toContain("origin/production sha");
	});

	test("a custom grace window is honoured", () => {
		const r = assessDeployFreshness({
			expectedCommittedAt: minutesAgo(45),
			expectedSha: B,
			graceMinutes: 60,
			liveSha: A,
			now: NOW,
		});
		expect(r.status).toBe("deploying");
		expect(r.failing).toBe(false);
	});
});

describe("parseLiveSha", () => {
	test("extracts a 40-char sha from the sentry baggage marker", () => {
		const html = `<meta name="baggage" content="sentry-release=${A},sentry-public_key=abc"/>`;
		expect(parseLiveSha(html)).toBe(A);
	});

	test("is case-insensitive on the hex and normalizes to lowercase", () => {
		const upper = "A".repeat(40);
		expect(parseLiveSha(`sentry-release=${upper},x=1`)).toBe(A);
	});

	test("ignores a non-sha release name rather than inventing a comparison", () => {
		expect(parseLiveSha("sentry-release=v3.287.1,x=1")).toBeNull();
		expect(parseLiveSha("sentry-release=abc123,x=1")).toBeNull();
	});

	test("returns null when the marker is absent", () => {
		expect(parseLiveSha("<html><body>nothing here</body></html>")).toBeNull();
	});

	test("does not match a longer hex run as if it were a sha", () => {
		expect(parseLiveSha(`sentry-release=${"a".repeat(41)},x=1`)).toBeNull();
	});
});
