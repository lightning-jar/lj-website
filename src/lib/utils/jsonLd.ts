/**
 * Serialize a schema.org object for a JSON-LD <script> block rendered
 * via {@html}. Escapes `<` so content can never terminate the script
 * element early (the standard XSS guard for inline JSON-LD).
 */
export function jsonLdScript(data: Record<string, unknown>): string {
	const json = JSON.stringify(data).replace(/</g, "\\u003c");
	return `<script type="application/ld+json">${json}</script>`;
}

export const LJ_PUBLISHER = {
	"@type": "Organization",
	name: "Lightning Jar",
	url: "https://www.lightningjar.com",
	logo: {
		"@type": "ImageObject",
		url: "https://www.lightningjar.com/icon.svg",
	},
} as const;
