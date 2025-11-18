export function deslugify(str?: string | null): string {
	if (!str) return "";
	const result = str
		.trim()
		.replace(/-/g, " ")
		.replace(/\b\w/g, (c) => c.toUpperCase());
	return result;
}

export default deslugify;
