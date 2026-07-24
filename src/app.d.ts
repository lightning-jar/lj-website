// raw-text imports (Vite ?raw suffix; vite/client types are not in
// tsconfig "types", so declare the module shape here)
declare module "*.md?raw" {
	const content: string;
	export default content;
}

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
