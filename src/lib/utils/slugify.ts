interface SlugifyOptions {
	[key: string]: unknown;
	separator?: string;
	def?: string | null;
	maxLength?: number;
}

export function slugify(
	s?: string | number | null,
	options?: SlugifyOptions,
): string {
	const defVal = options?.def ?? "";
	// Check if the input is null or empty string
	if (s == null || s === "") return defVal;

	const sep = options?.separator ?? "-";
	const limit = options?.maxLength ?? 255;
	const str = String(s).slice(0, limit).toLowerCase();

	const out: string[] = [];
	let lastWasSep = true;

	for (let i = 0; i < str.length; i++) {
		const code = str.charCodeAt(i);
		const okAscii =
			(code >= 0x30 && code <= 0x39) || (code >= 0x61 && code <= 0x7a);
		const ch = str[i];
		const ok = okAscii;
		if (ok) {
			out.push(ch);
			lastWasSep = false;
		} else if (!lastWasSep) {
			out.push(sep);
			lastWasSep = true;
		}
	}
	if (lastWasSep && out.length) out.pop();

	let n = out.join("");
	if (!n.length) n = defVal;
	return n;
}
export default slugify;
