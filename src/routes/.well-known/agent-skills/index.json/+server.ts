import { createHash } from "node:crypto";

import aeoSkillMd from "$content/skills/aeo-bench-data/SKILL.md?raw";
import skillMd from "$content/skills/barkup-bench-data/SKILL.md?raw";

import type { RequestHandler } from "./$types";

// Agent Skills Discovery index (RFC v0.2.0,
// https://github.com/cloudflare/agent-skills-discovery-rfc). The digest
// is computed from the same imported bytes the SKILL.md route serves,
// so it can never drift from the artifact.
export const prerender = false;

const BASE = "https://www.lightningjar.com";

const digestOf = (md: string) =>
	`sha256:${createHash("sha256").update(md, "utf8").digest("hex")}`;
const digest = digestOf(skillMd);
const aeoDigest = digestOf(aeoSkillMd);

const index = {
	$schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
	skills: [
		{
			name: "barkup-bench-data",
			type: "skill-md",
			description:
				"Query Barkup Bench, Lightning Jar's open, pre-registered benchmark series on how LLM agents read and edit structured document trees — list studies, read full findings, and pull supporting resources via the public keyless MCP server or plain HTTP.",
			url: `${BASE}/.well-known/agent-skills/barkup-bench-data/SKILL.md`,
			digest,
		},
		{
			name: "aeo-bench-data",
			type: "skill-md",
			description:
				"Query AEO Bench, Lightning Jar's open, pre-registered benchmark series measuring whether agent-readiness and answer-engine-optimization techniques actually help AI agents use websites — list studies, read full findings, and pull supporting resources via the public keyless MCP server or plain HTTP.",
			url: `${BASE}/.well-known/agent-skills/aeo-bench-data/SKILL.md`,
			digest: aeoDigest,
		},
	],
};

export const GET: RequestHandler = () =>
	new Response(JSON.stringify(index, null, "\t"), {
		headers: {
			"content-type": "application/json; charset=utf-8",
			"cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
		},
	});
