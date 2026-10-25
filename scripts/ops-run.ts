/**
 * The ONLY command the `lj-ops-script` and `lj-smoke-script` swamp
 * behaviors run (ops/swamp/models/command/shell/*.yaml):
 *
 *   bunx varlock run -- bun scripts/ops-run.ts
 *
 * with the target script and its flags passed as ENVIRONMENT VARIABLES
 * (OPS_SCRIPT, OPS_ARGS) rather than interpolated into a shell line. swamp
 * does not enforce JSON-schema `pattern` on behavior inputs, so the fence
 * has to be structural: the script path is validated against
 * scripts/<name>.ts and the flags are split into discrete argv by
 * #lib/utils/shellArgs and handed to Bun.spawn WITHOUT a shell — a `;` in a
 * flag is just a character. Same entry point as replicator and
 * slx-customer-portal.
 *
 * Exit code = the child's exit code (each script's own swamp contract passes
 * straight through); 64 = ops-run refused the request itself.
 */

import { isRepoScriptPath, splitArgs } from "#lib/utils/shellArgs.js";

const REPO = new URL("..", import.meta.url).pathname;
const script = process.env.OPS_SCRIPT ?? "";
const rawArgs = process.env.OPS_ARGS ?? "";

if (!isRepoScriptPath(script)) {
	console.error(
		`ops-run: refused OPS_SCRIPT ${JSON.stringify(script)} — must be scripts/<name>.ts`,
	);
	process.exit(64);
}

let args: string[];
try {
	args = splitArgs(rawArgs);
} catch (err) {
	console.error(
		`ops-run: refused OPS_ARGS — ${err instanceof Error ? err.message : String(err)}`,
	);
	process.exit(64);
}

const { OPS_SCRIPT: _s, OPS_ARGS: _a, ...childEnv } = process.env;
const child = Bun.spawn(["bun", script, ...args], {
	cwd: REPO,
	env: childEnv,
	stderr: "inherit",
	stdin: "ignore",
	stdout: "inherit",
});
process.exit(await child.exited);
