// prerender: true
export const prerender = true;

// import version
import { version } from "$app/env";

// footer content
import { default as footer } from "#lib/data/footer.json";

// env variables
import { ENV } from "varlock/env";

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
