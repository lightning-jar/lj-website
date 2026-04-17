// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
	// interface Locals {}
	// interface PageData
	// interface Platform {}
	// interface PrivateEnv {}
	// interface PublicEnv {}
}

// Vercel-provided environment variables. These are injected at runtime by Vercel
// but are not always present in local `.env` files, so we declare them here so
// TypeScript can resolve them via `$env/static/private`.
declare module "$env/static/private" {
	export const VERCEL_ENV: string;
	export const VERCEL_PROJECT_PRODUCTION_URL: string;
}
