// Voice-input transcription for Ask Eljay: the client posts a short
// recorded clip (webm/opus from MediaRecorder) as the raw body and gets
// the Deepgram Nova-3 transcript back. Ported from replicator's
// /api/transcribe, with one structural difference: replicator's is
// session-authed, this site is public — so the fences here are the
// same stack the chat endpoint uses (origin allowlist + shared Upstash
// rate limiter + size caps). Fail-closed: no DEEPGRAM_API_KEY → 503,
// and the mic button surfaces the error while text chat is unaffected.

import { json } from "@sveltejs/kit";

import type { RequestHandler } from "./$types";

import { ALLOWED_ORIGINS } from "$lib/server/allowedOrigins";
import { createRateLimiter } from "$lib/server/rateLimit";
import { ENV } from "varlock/env";

export const prerender = false;

// Dictation for a 2,000-char chat input, not long-form audio: opus at
// dictation bitrates runs ~3-4KB/s, so 2.5MB is roughly ten minutes —
// far past the client's 90s auto-stop, tight enough to bound Deepgram
// spend. The rate limiter is the primary cost fence.
const MIN_BYTES = 200;
const MAX_BYTES = 2.5 * 1024 * 1024;

const limiter = createRateLimiter({
	prefix: "rl:transcribe",
	rules: [
		{ name: "ip", max: 10, windowSec: 300, scope: "ip" },
		{ name: "daily", max: 200, windowSec: 86_400, scope: "global" },
	],
	redisUrl: ENV.KV_REST_API_URL || undefined,
	redisToken: ENV.KV_REST_API_TOKEN || undefined,
});

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	if (!ENV.DEEPGRAM_API_KEY)
		return json({ error: "Voice input is not available." }, { status: 503 });

	const origin = request.headers.get("origin");
	if (!origin || !ALLOWED_ORIGINS.has(origin))
		return json(
			{ error: "This endpoint serves the site's own chat UI." },
			{ status: 403 },
		);

	let ip = "unknown";
	try {
		ip = getClientAddress();
	} catch {
		// prerender/analysis contexts — keep the fallback key
	}
	const verdict = await limiter.check(ip);
	if (!verdict.ok)
		return json(
			{ error: "Too many recordings — give it a few minutes." },
			{
				status: 429,
				headers: { "retry-after": String(verdict.retryAfterSec) },
			},
		);

	const buffer = await request.arrayBuffer();
	if (buffer.byteLength < MIN_BYTES)
		return json({ error: "Empty recording." }, { status: 400 });
	if (buffer.byteLength > MAX_BYTES)
		return json({ error: "Recording too large." }, { status: 413 });

	// Direct REST call — one request, no SDK dependency. Dictation is
	// single-speaker: no diarization; smart_format adds punctuation.
	try {
		const res = await fetch(
			"https://api.deepgram.com/v1/listen?model=nova-3&smart_format=true&language=en",
			{
				method: "POST",
				headers: {
					authorization: `Token ${ENV.DEEPGRAM_API_KEY}`,
					"content-type": request.headers.get("content-type") ?? "audio/webm",
				},
				body: buffer,
				signal: AbortSignal.timeout(30_000),
			},
		);
		if (!res.ok) throw new Error(`deepgram ${res.status}`);
		const body = (await res.json()) as {
			metadata?: { duration?: number };
			results?: {
				channels?: { alternatives?: { transcript?: string }[] }[];
			};
		};
		const text =
			body.results?.channels?.[0]?.alternatives?.[0]?.transcript?.trim() ?? "";
		return json({ duration: body.metadata?.duration ?? 0, text });
	} catch (e) {
		console.error("transcribe failed:", e);
		return json(
			{ error: "Transcription failed — try again." },
			{ status: 502 },
		);
	}
};
