/**
 * Is what production SERVES the same commit as what the `production`
 * branch HOLDS? (Ported from replicator, whose deploy branch is `main`.)
 *
 * Why this exists. On 2026-10-24 three consecutive replicator releases (v3.285.0,
 * v3.286.0, v3.287.0) were merged and pushed while every Vercel production
 * build failed; production served v3.284.0 for hours. The 30-minute
 * `prod-smoke` workflow stayed GREEN the whole time, because home, sign-in,
 * the blog API and the MCP 401 all work fine on the *old* code. A deploy
 * that never happens is invisible to a health check — so health is not
 * enough; freshness has to be asserted separately.
 *
 * The one hazard to avoid is crying wolf: a legitimate push takes a few
 * minutes to build and promote, so a divergence younger than the grace
 * window is "deploying", not "stale". And when either side is unknown
 * (no release marker on the page, no git remote reachable) the verdict is
 * `unknown` and the check must NOT fail — a broken probe is not an outage.
 */

/** Divergence younger than this is a deploy in flight, not a failure. */
export const DEPLOY_GRACE_MINUTES = 20;

export type DeployFreshnessStatus =
	| "current"
	| "deploying"
	| "stale"
	| "unknown";

export interface DeployFreshnessInput {
	/** Commit sha production is serving (from the page's release marker). */
	liveSha: string | null;
	/** Commit sha the deploy branch points at (origin/production). */
	expectedSha: string | null;
	/** When the expected commit was authored, for the grace window. */
	expectedCommittedAt: Date | null;
	now: Date;
	graceMinutes?: number;
}

export interface DeployFreshnessResult {
	status: DeployFreshnessStatus;
	/** True when this should count as a smoke FAILURE. */
	failing: boolean;
	detail: string;
}

const short = (sha: string) => sha.slice(0, 7);

export function assessDeployFreshness(
	input: DeployFreshnessInput,
): DeployFreshnessResult {
	const grace = input.graceMinutes ?? DEPLOY_GRACE_MINUTES;

	if (!input.liveSha || !input.expectedSha) {
		const missing = [
			input.liveSha ? null : "live release marker",
			input.expectedSha ? null : "origin/production sha",
		]
			.filter(Boolean)
			.join(" and ");
		return {
			detail: `could not determine ${missing} — freshness not checked`,
			failing: false,
			status: "unknown",
		};
	}

	if (input.liveSha === input.expectedSha) {
		return {
			detail: `production is serving ${short(input.liveSha)} (current)`,
			failing: false,
			status: "current",
		};
	}

	const ageMinutes =
		input.expectedCommittedAt === null
			? null
			: Math.floor(
					(input.now.getTime() - input.expectedCommittedAt.getTime()) / 60_000,
				);

	if (ageMinutes !== null && ageMinutes < grace) {
		return {
			detail: `production serves ${short(input.liveSha)}, origin/production is ${short(input.expectedSha)} (pushed ${ageMinutes}m ago — within the ${grace}m deploy window)`,
			failing: false,
			status: "deploying",
		};
	}

	const age =
		ageMinutes === null
			? "age unknown"
			: ageMinutes >= 120
				? `${Math.floor(ageMinutes / 60)}h old`
				: `${ageMinutes}m old`;
	return {
		detail: `STALE DEPLOY — production serves ${short(input.liveSha)} but origin/production is ${short(input.expectedSha)} (${age}, past the ${grace}m window). The production build is most likely FAILING: check Vercel's deployment list for state ERROR on the production target.`,
		failing: true,
		status: "stale",
	};
}

/**
 * Pull the deployed commit sha out of a rendered page. Sentry stamps the
 * build's commit into a `sentry-release=<sha>` baggage/meta value; only a
 * full 40-char hex sha is trusted, so a non-git release name yields null
 * (and therefore an `unknown`, non-failing verdict) rather than a bogus
 * comparison.
 */
export function parseLiveSha(html: string): string | null {
	const match = html.match(/sentry-release=([0-9a-f]{40})\b/i);
	return match ? match[1].toLowerCase() : null;
}
