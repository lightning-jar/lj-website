// The concierge's suggested starter prompts — single source of truth.
// The chat UI renders a random subset as chips, and the API route uses
// the same list as the allowlist for response caching (a first-turn
// message that exactly matches one of these is served from cache).
export const CONCIERGE_SUGGESTIONS = [
	"What is Lightning Jar?",
	"What kind of research is Lightning Jar doing?",
	"What are the key findings of LJ's AEO research?",
	"What is the AEO Playbook?",
	"Have you built transit websites?",
	"What is woof-editor?",
	"What is Replicator?",
	"What is Barkup?",
	"What is Barkdown?",
] as const;
