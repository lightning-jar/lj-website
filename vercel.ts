import type { VercelConfig } from "@vercel/config/v1";

const config: VercelConfig = {
	framework: "sveltekit-1",
	buildCommand: "vite build",
	installCommand: "bun install",
	outputDirectory: ".vercel/output",
	trailingSlash: false,
	headers: [
		{
			// agent discovery (RFC 8288): point agents at the API catalog
			// and LLM-readable docs from the homepage
			source: "/",
			headers: [
				{
					key: "Link",
					value:
						'</.well-known/api-catalog>; rel="api-catalog", </llms.txt>; rel="service-doc"; type="text/plain", </.well-known/mcp/server-card.json>; rel="service-desc"; type="application/json"',
				},
			],
		},
		{
			// the catalog route sets its own content-type; this guards the
			// static server-card.json media type stays JSON at the edge
			source: "/.well-known/mcp/server-card.json",
			headers: [
				{ key: "Content-Type", value: "application/json; charset=utf-8" },
			],
		},
		{
			source: "/(atom.xml|blog/atom.xml|reading-list/atom.xml)",
			headers: [
				{
					key: "Content-Type",
					value: "application/atom+xml; charset=utf-8",
				},
			],
		},
		{
			// Draft previews: the shell is client-rendered, so the server
			// load's setHeaders lands on the data request, not this HTML
			// response — enforce no-crawl + no-cache at the platform layer.
			source: "/blog/preview/(.*)",
			headers: [
				{
					key: "X-Robots-Tag",
					value:
						"noindex, nofollow, noarchive, nosnippet, notranslate, noimageindex",
				},
				{ key: "Cache-Control", value: "private, no-store" },
			],
		},
		{
			source: "/(.*)",
			headers: [
				{
					key: "Access-Control-Allow-Origin",
					value: "https://www.lightningjar.com",
				},
				{
					key: "Content-Security-Policy",
					value:
						"default-src 'self' https://lj-01.nyc3.cdn.digitaloceanspaces.com; font-src 'self' https://fonts.bunny.net; script-src 'self' 'unsafe-inline' https://plausible.io; style-src 'self' 'unsafe-inline'; img-src 'self' https://lj-01.nyc3.cdn.digitaloceanspaces.com https://fypqozx5ulkwvv6l.public.blob.vercel-storage.com; connect-src 'self' https://plausible.io https://*.sentry.io https://*.ingest.sentry.io https://lj-01.nyc3.cdn.digitaloceanspaces.com https://replicator.lj.dev https://replicator.securelogix.dev; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; block-all-mixed-content; upgrade-insecure-requests",
				},
				{ key: "X-Frame-Options", value: "DENY" },
				{ key: "X-Content-Type-Options", value: "nosniff" },
				{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
				{ key: "X-XSS-Protection", value: "1; mode=block" },
				{
					key: "Strict-Transport-Security",
					value: "max-age=31536000; includeSubDomains; preload",
				},
				{
					key: "Permissions-Policy",
					value:
						"accelerometer=(), autoplay=(), camera=(), cross-origin-isolated=(), display-capture=(), encrypted-media=(), fullscreen=(), geolocation=(), gyroscope=(), keyboard-map=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), serial=(), usb=(), web-share=(), xr-spatial-tracking=(), hid=(), idle-detection=(), sync-xhr=()",
				},
			],
		},
	],
	redirects: [
		{ source: "/privacy-policy", destination: "/terms", statusCode: 301 },
		{
			source: "/blog/the-rule-you-forgot-you-wrote",
			destination:
				"/blog/stronger-llms-follow-conflicting-instructions-more-literally",
			statusCode: 301,
		},
		{
			source: "/barkup-bench",
			destination: "/research/barkup-bench",
			statusCode: 301,
		},
		{
			source: "/blog/introduction-to-pimcore",
			destination: "/archive/introduction-to-pimcore",
			statusCode: 301,
		},
		{
			source: "/podcast/thunderclap/01-introduction-to-pimcore",
			destination: "/archive/introduction-to-pimcore",
			statusCode: 301,
		},
		{
			source: "/blog/what-is-pimcore",
			destination: "/archive/introduction-to-pimcore",
			statusCode: 301,
		},
		{
			source: "/assets/favicon/lj-favicon.svg",
			destination: "/icon.svg",
			statusCode: 301,
		},
		{
			source: "/assets/img/lightning-jar-logo-04.png",
			destination: "/lightning-jar-logo.svg",
			statusCode: 301,
		},
		{ source: "/favicon.ico", destination: "/icon.svg", statusCode: 301 },
		{
			source: "/podcast/thunderclap",
			destination: "/archive",
			statusCode: 301,
		},
	],
};

export default config;
