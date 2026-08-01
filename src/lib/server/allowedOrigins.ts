// Origins allowed to call the site's own browser-facing APIs
// (/api/concierge, /api/transcribe). Browsers always send Origin on
// fetch POSTs; requiring a known one blocks drive-by scripts and naive
// scrapers. A determined client can spoof it — this is a fence, not
// the wall.
export const ALLOWED_ORIGINS = new Set([
	"https://www.lightningjar.com",
	"https://lightningjar.com",
	"https://ljweb.bench.lj.dev",
	"http://localhost:5193",
]);
