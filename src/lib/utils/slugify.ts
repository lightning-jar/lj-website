export interface SlugifyOptions {
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
	if (s == null || s === "") return defVal;

	const sep = options?.separator ?? "-";
	const limit = options?.maxLength ?? 255;

	// Slice before processing as required by tests
	// Normalize to NFD and strip combining marks to handle accents
	const raw = String(s).slice(0, limit);
	const str = raw
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase();

	const out: string[] = [];
	let lastWasSep = true;

	for (let i = 0; i < str.length; i++) {
		const code = str.charCodeAt(i);
		const okAscii =
			(code >= 0x30 && code <= 0x39) || (code >= 0x61 && code <= 0x7a);
		const ch = str[i];

		if (okAscii) {
			if (out.length < limit) {
				out.push(ch);
				lastWasSep = false;
			} else {
				break;
			}
		} else if (!lastWasSep) {
			// add separator only if we still have room and last wasn't a separator
			if (out.length < limit) {
				out.push(sep);
				lastWasSep = true;
			} else {
				break;
			}
		}
	}

	if (lastWasSep && out.length) out.pop();

	let n = out.join("");
	if (!n.length) n = defVal;
	return n;
}
export default slugify;
