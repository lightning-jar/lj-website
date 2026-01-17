// prerender: true
export const prerender = true;

// import version
import { version } from "$app/environment";
// env variables
import { VERCEL_ENV, VERCEL_PROJECT_PRODUCTION_URL } from "$env/static/private";

// footer content
import { default as footer } from "$data/footer.json";

const isProduction = VERCEL_ENV === "production";
const productionUrl = VERCEL_PROJECT_PRODUCTION_URL;

// load function
export async function load({ url }) {
	return {
		footer,
		isHome: url.pathname === "/",
		isProduction,
		pathname: url?.pathname ?? "",
		productionUrl,
		version,
	};
}
