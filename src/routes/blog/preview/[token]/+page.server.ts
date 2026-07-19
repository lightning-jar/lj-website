// env
import { ENV } from "varlock/env";

// Draft previews are dynamic by nature (unguessable tokens, content that
// changes during review), so this route is excluded from the site-wide
// prerender. It is also NOT server-rendered: the browser fetches the
// draft straight from the CMS by its token (the token IS the access
// control, and the preview endpoint is keyless + CORS-open), so no
// secret ever reaches the client — this load only hands over the public
// CMS base URL and serves the empty shell.
export const prerender = false;
export const ssr = false;

const NO_CRAWL =
	"noindex, nofollow, noarchive, nosnippet, notranslate, noimageindex";

export function load({ setHeaders }) {
	setHeaders({
		// Belt-and-suspenders no-crawl: the layout emits a robots <meta> from
		// meta.robotsFollow below, but this response header keeps the shell
		// uncrawlable independent of the render layer.
		"x-robots-tag": NO_CRAWL,
		// Never cache a draft preview shell — reviewers must always get the
		// bundle that re-fetches the latest draft.
		"cache-control": "private, no-store",
	});

	return {
		cmsBaseUrl: ENV.BLOG_CMS_BASE_URL ?? "",
		meta: {
			title: "Draft Preview",
			description: "",
			robotsFollow: false,
		},
	};
}
