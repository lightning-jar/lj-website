// prerender: true
export const prerender = true;

// import version
import { version } from "$app/environment";
// env variables
import { ENV } from "varlock/env";

// footer content
import { default as footer } from "$data/footer.json";

const isProduction = ENV.VERCEL_ENV === "production";
const productionUrl = ENV.VERCEL_PROJECT_PRODUCTION_URL;

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
