/**
 * Converts a camelCase or PascalCase string to kebab-case
 * @param input The string to convert (e.g. "PressReleases" or "pressReleases")
 * @returns The kebab-case version of the string (e.g. "press-releases")
 */
export default function toKebabCase(input?: string | null): string {
	// Handle empty strings
	if (!input) return "";

	return (
		input
			// Insert a hyphen before any uppercase letter that follows a lowercase letter
			.replace(/([a-z])([A-Z])/g, "$1-$2")
			// Convert the entire string to lowercase
			.toLowerCase()
	);
}
