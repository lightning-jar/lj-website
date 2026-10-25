/**
 * Argument handling for scripts/ops-run.ts — the single entry point the swamp
 * `command/shell` behavior executes. Workflow inputs reach it as environment
 * variables; these functions turn them into a validated script path and a
 * discrete argv for Bun.spawn, so no shell ever interprets them.
 *
 * Why structural and not a schema `pattern`: swamp does not enforce
 * JSON-schema `pattern` on behavior inputs, so a schema fence alone is
 * decoration (verified in slx-customer-portal's 2026-10-23 push review;
 * ported here from replicator 2026-10-25).
 */

/** `scripts/<name>.ts` only — no directories, traversal, or anything else. */
export function isRepoScriptPath(path: string): boolean {
	return /^scripts\/[A-Za-z0-9._-]+\.ts$/.test(path);
}

/**
 * Split a flag string into argv. Whitespace separates arguments; a
 * double-quoted span (anywhere in an argument, e.g. `--subject="a b"`) keeps
 * its spaces and loses its quotes. Nothing else is special: `;`, `|`, `$`,
 * backticks are plain characters. An unterminated quote throws.
 */
export function splitArgs(input: string): string[] {
	const args: string[] = [];
	let current = "";
	let inArg = false;
	let inQuote = false;
	const flush = () => {
		if (inArg) args.push(current);
		current = "";
		inArg = false;
	};
	for (const ch of input) {
		if (ch === '"') {
			inQuote = !inQuote;
			inArg = true;
		} else if (!inQuote && /\s/.test(ch)) {
			flush();
		} else {
			current += ch;
			inArg = true;
		}
	}
	if (inQuote) throw new Error("unterminated double quote in arguments");
	flush();
	return args;
}
