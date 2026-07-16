<script lang="ts">
// components
import LinkButton from "$components/LinkButton.svelte";

// shared headline numbers: src/lib/data/research-stats.json
import researchStats from "$data/research-stats.json";

// shared dashboard styles (mirrors /research/barkup-bench)
const eyebrowCls =
	"font-mono text-12px tracking-[0.14em] uppercase text-maximumYellow mb-1.5";
const proseCls = "text-[#c3c9d4] max-w-[56rem]";
const linkCls = "text-maximumYellow hover:underline underline-offset-3";
const codeCls =
	"bg-[hsl(217,44%,19%)] border border-white/14 rounded-md px-4.5 py-4 overflow-x-auto font-mono text-13px leading-[1.6] text-[#dfe4ec] whitespace-pre";

interface Play {
	id: string;
	eyebrow: string;
	title: string;
	// paragraphs; may contain inline html (links, <strong>)
	prose: string[];
	// rendered verbatim in a <pre>
	code?: string;
	codeCaption?: string;
	measured: string;
}

const dash = "/research/barkup-bench";
const repo = "https://github.com/kevinpeckham/barkup-bench";

const plays: Play[] = [
	{
		id: "ids-and-patches",
		eyebrow: "01 · The foundation · main matrix + Study H",
		title: "Give every node a permanent id, and edit by anchored patches",
		prose: [
			`A user asks your page builder to change one headline in a 1,000-node layout. Whole-document rewrite makes the model reproduce the 999 nodes it is not touching: about $0.88 and ten minutes per solved edit at that size, and cheap-tier models collapse outright. Positional patches (RFC 6902) decay toward 10% because indexes shift under the model's feet. Id-anchored patches were the only interface both model tiers held above roughly 300 nodes, at about $0.26 and four seconds per solved 1,000-node edit.`,
			`Assign every node a stable id at creation and never recycle it. Have the model reply with a small array of operations that address nodes by id, with placements anchored to sibling ids (<code>before</code>/<code>after</code>) instead of positions. Apply atomically, validate against your schema, and send any issues back verbatim for one correction round. Never make the model reproduce what it is not changing.`,
		],
		code: `import { applyAnchoredPatch } from "@kevinpeckham/barkup/patch";

// The model replies with operations addressing nodes by id:
// set-attribute, remove-attribute, set-name, remove,
// insert (with a fresh id), move.
const result = applyAnchoredPatch(grammar, storedTree, JSON.parse(reply));
if (!result.ok) return retryWithFeedback(result.issues); // verbatim
persist(result.node); // the input tree is never mutated`,
		measured: `Anchored patches held 87 to 100% where whole-document rewrite fell to 0 to 80% on the cheap tier (<a class="${linkCls}" href="${dash}#sec-sizeext">chart</a>). Across the whole series, zero failures were ever caused by a model mangling a stable id. Write-up: <a class="${linkCls}" href="/blog/we-found-the-crossover">We Found the Crossover</a>.`,
	},
	{
		id: "focused-views",
		eyebrow: "02 · Context · Studies I, J, U",
		title: "Send a focused view, and cover every node the request mentions",
		prose: [
			`"Make the hero headline match the promo card title" writes one node but reads another. Show the model a view containing only the write target and it will not error, refuse, or ask. It invents a plausible title, formats it perfectly, and applies it: 90 times out of 90 in our test, with zero refusals. Nothing in your logs will ever flag it.`,
			`Render a focused view: the relevant region expanded, everything else collapsed to id-bearing placeholders. A view of about 1.5k tokens matches full-document accuracy at 1 to 4% of the input, and its size scales with tree depth, not document size. But treat the focus list as a correctness contract: every node the request mentions, reads, or compares against must be in it, not just the node being written.`,
		],
		code: `import { renderView, VIEW_PROMPT_RULES } from "@kevinpeckham/barkup/view";

// The request reads the card title and writes the hero headline.
// BOTH ids go in the focus list; the rest of the document
// collapses to id-bearing placeholders.
const view = renderView(grammar, storedTree, {
	focus: [heroHeadlineId, promoCardTitleId],
});`,
		measured: `Target-only views: 0 of 90, every failure a silent invention. Views covering both nodes: 90 of 90 at 25 times less input than the full document (<a class="${linkCls}" href="${dash}#sec-dependent">chart</a>). Write-up: <a class="${linkCls}" href="/blog/the-two-things-your-agent-cant-see">The Two Things Your Agent Can't See</a>.`,
	},
	{
		id: "one-search-call",
		eyebrow: "03 · Grounding · Studies L, N",
		title:
			"When the user doesn't name a target, give the model one search call",
		prose: [
			`"Fix the typo in the pricing section" names no node. Give the model a skeleton view of the document plus a single deterministic keyword-search tool and it grounds plain-language requests at oracle-level accuracy, at a median of exactly one call and a tenth of the input of showing everything.`,
			`Two things not to build: off-the-shelf embeddings measured no better than keyword overlap for structural references, and navigation tools (open node, list children) were a trap: oracle accuracy on the frontier model at higher cost than showing the whole document, and collapse on the cheap one.`,
		],
		code: `import { findNodes, renderSearch } from "@kevinpeckham/barkup/view";

// One tool. Deterministic keyword scoring, no embeddings.
function searchTool(query: string): string {
	return renderSearch(grammar, storedTree, findNodes(storedTree, query));
}`,
		measured: `Skeleton plus one search call: oracle-level grounding on the frontier tier, median exactly one call (<a class="${linkCls}" href="${dash}#sec-retrieval">chart</a>). Write-up: <a class="${linkCls}" href="/blog/then-we-found-the-cheap-part">Then We Found the Cheap Part</a>.`,
	},
	{
		id: "worked-examples",
		eyebrow: "04 · Sessions · Studies M, P, S",
		title: "Drop conversation history; teach with two worked examples",
		prose: [
			`What conversation history actually contributes to an editing session is teaching, not memory. Two canned worked examples of your patch dialect's tricky operations, about 900 tokens in the system prompt, restore stateless sessions to full-history accuracy. Measured through 36-edit sessions with no decay: edit 36 solved as well as edit 1, at a flat ~2.1k input tokens per step while keep-everything history grows linearly to 24k.`,
			`Pick the examples once, for the operations models actually fumble (an insert with a sibling anchor, a move). They are part of your system prompt, not per-session state, which also makes them cacheable under guideline 08.`,
			`The tier nuance (Study AD): the frontier tier does not need them. On claude-opus-4.8, bare stateless sessions with no examples at all scored 240 of 240, so on frontier models the block is insurance rather than a requirement. Keep it anyway: it is 900 flat tokens, it rescues every tier below the frontier (sonnet without it: 13 of 20 intact end states), and it protects any fallback routing.`,
		],
		code: `// System prompt skeleton for a stateless editing turn:
//   1. dialect rules (what operations exist, how anchors work)
//   2. worked example: insert with a sibling anchor
//   3. worked example: move
//   -- cache breakpoint --
//   4. fresh focused view of the current tree state
//   5. the current request (plus memo and echo, guidelines 05-07)`,
		measured: `Stateless with two examples ties full history through 36-edit sessions at 5 to 6 times less input (<a class="${linkCls}" href="${dash}#sec-horizon">chart</a>). Write-ups: <a class="${linkCls}" href="/blog/two-examples-replace-a-memory">Two Examples Replace a Memory</a> and <a class="${linkCls}" href="/blog/the-thirty-sixth-edit">The Thirty-Sixth Edit</a>.`,
	},
	{
		id: "memo",
		eyebrow: "05 · Declared state · Studies T, V, W, Y",
		title:
			"Keep an app-held memo of everything the user declares, and let the agent write it",
		prose: [
			`"Rename it to the codename we settled on" fails a stateless editor 100% of the time by construction: the answer lives in a conversation the model no longer sees. A short app-held memo of declared facts, standing rules, and goals, appended to every request, recovered every such callback at 2% extra cost.`,
			`The memo also carries qualitative goals at full parity with restating them in the request, where merely showing the model the document node the goal lives in lost 117 of 120 judged comparisons. Views carry values; memos carry goals. And you can delegate the writing: agent-extracted memos tied a perfect-oracle baseline on all three models tested, handled retractions, survived casual human phrasing at exact parity, and produced zero false notes from 432 conversational chatter baits.`,
			`One thing NOT to add (Study AF): a clause telling the agent to restate the goal in its own words before a goal-directed rewrite. We measured it at perfect compliance and zero wins in ninety judged comparisons; the model says the goal accurately and then orbits it anyway, and on the memo path the ceremony measures neutral to mildly negative. Prompt clauses that dramatize reasoning are not context that changes it. Put the goal in the memo or the instruction, and stop there; the memo's goal-carriage parity replicated contemporaneously on a third model tier in the same study.`,
		],
		code: `## Session notes (app-maintained memo)
Declared facts, standing rules, and goals from this session --
authoritative even when the conversation that declared them is no
longer visible. Apply standing rules to every edit they cover without
being reminded, and anchor goal-directed rewrites on the goals below.
PRECEDENCE: a direct, explicit instruction in the current request
overrides any note here for that request -- the memo carries standing
intent, not vetoes (a one-off override is not a retraction; keep the
note unless the user retracts it).
Facts:
- The product's launch codename is "Nightjar".
Rules:
- Write product names in title case.
Goals:
- The pricing page should read as reassuring, not salesy.`,
		codeCaption:
			"The benchmark-validated block, verbatim including the precedence sentence (guideline 06).",
		measured: `Memo restores history-parity at 1.02 times stateless cost (<a class="${linkCls}" href="${dash}#sec-memo">chart</a>); goals via memo win 117 of 120 over goals via view (<a class="${linkCls}" href="${dash}#sec-goals">chart</a>); agent-written memos tie the oracle (<a class="${linkCls}" href="${dash}#sec-extraction">chart</a>); restate-first ceremony: 0 wins in 90 at perfect compliance (<a class="${linkCls}" href="${dash}#sec-restate">chart</a>). Write-ups: <a class="${linkCls}" href="/blog/views-carry-values-memos-carry-goals">Views Carry Values, Memos Carry Goals</a>, <a class="${linkCls}" href="/blog/who-writes-the-memo">Who Writes the Memo?</a>, and <a class="${linkCls}" href="/blog/repeating-the-goal-doesnt-make-it-yours">Repeating the Goal Doesn't Make It Yours</a>.`,
	},
	{
		id: "precedence",
		eyebrow: "06 · The memo's fence · Studies AA, AB",
		title: "Put a precedence sentence inside the memo block",
		prose: [
			`The memo steers so strongly it has a failure mode: with a standing rule on file ("always include the trademark symbol") and a user asking for a one-off exception ("written plain, no trademark symbol"), the strongest model enforced the memo against the user 12 times out of 12.`,
			`One sentence inside the memo block header fixed every case: a direct, explicit instruction in the current request overrides any note here for that request. Placement is the whole trick. The same sentence class buried in a styleguide moved nothing; at the point of injury it restored 0 of 12 to 12 of 12 with zero cost to the memo's legitimate steering. The block in guideline 05 already includes it.`,
		],
		measured: `Countermands honored: opus 0 of 12 without the clause, 12 of 12 with it (p = .0005); steering preserved 12 of 12 everywhere (<a class="${linkCls}" href="${dash}#sec-conflict">chart</a>).`,
	},
	{
		id: "last-edit-echo",
		eyebrow: "07 · The previous turn · Study X",
		title: "Echo the previous edit back with each request",
		prose: [
			`"Undo that." "Actually make it shorter." A stateless editor fails these 0 for 144, and every failure is a silent guess at what "that" was. The fix is one app-generated line describing the last applied edit, appended to the request. It restored full-history parity at half the cost, and beat keeping history outright on the production tier.`,
			`Your app already knows what it just applied; the echo is a string template, not a model call.`,
		],
		code: `Previous edit (applied by the app): set "content" from "Q3 Draft
Overview" to "Q3 Final Overview" on the text-atom "headline" (id n214).`,
		measured: `Echo ties full history overall and beat it on opus, 48 of 48 versus 46 of 48, at half the input (<a class="${linkCls}" href="${dash}#sec-anaphora">chart</a>). Write-up: <a class="${linkCls}" href="/blog/undo-that">Undo That</a>.`,
	},
	{
		id: "standing-context",
		eyebrow: "08 · Standing context · Studies Z, AA",
		title: `Ship the brand pack whole, cache it, and soften your "always" rules`,
		prose: [
			`Most production editors ship a standing block with every request: company facts, client records, a styleguide. It simply works at production sizes. Models copied exact facts past three same-schema distractor clients and applied unstated styleguide rules at any position in the pack, 216 of 216 per arm, with zero cross-client contamination in 324 cells. Do not bother slicing the pack per request: it bought nothing and forfeits prompt caching.`,
			`Layout matters for cost: put everything static (dialect rules, worked examples, the pack) in one block under a single cache breakpoint, and everything per-request (view, memo, echo, request) after it. The shipped layout read 64 to 68% of input from cache, cutting effective input cost by a quarter to nearly half.`,
			`One hazard: when a rule written with "always" collides with what the user asked for, models do not break the spec, they pick a reading, and which reading is not predictable across models. Softening the wording to "we generally prefer" resolved the conflict cleanly where a priority meta-rule in the styleguide did not. Audit your pack for absolutes.`,
		],
		code: `const system = [
	{
		role: "system",
		content: dialectRules + workedExamples + brandPack, // static
		providerOptions: {
			anthropic: { cacheControl: { type: "ephemeral" } },
		},
	},
	{ role: "system", content: view + memo + echo }, // per-request tail
];`,
		measured: `Facts and rules 216 of 216 per arm, zero contamination in 324 cells; cached layout cut effective input cost 25 to 43% (<a class="${linkCls}" href="${dash}#sec-standing">chart</a>); soft phrasing resolved the conflicts a meta-rule could not (<a class="${linkCls}" href="${dash}#sec-conflict">chart</a>).`,
	},
	{
		id: "decompose-fanout",
		eyebrow: "09 · Bulk edits · Studies Q, R",
		title: "Never ask one prompt for N edits",
		prose: [
			`"Change every button in the section" broke every strategy we tested, including perfect retrieval: models deliver roughly half of N targets and stop, confident. No prompt intervention rescued it, not exhaustiveness instructions, not a worked example, not asking it to count.`,
			`The fix is structural. Enumerate the targets with a deterministic query, then issue one small single-target edit per node. Deterministic work goes to deterministic code; the model only ever sees tasks shaped like the ones it solves at 100%.`,
		],
		code: `import { selectNodes } from "@kevinpeckham/barkup/view";

// The app enumerates; the model edits one target at a time.
const targets = selectNodes(storedTree, {
	type: "button-atom",
	within: sectionId,
});
for (const id of targets) {
	await applySingleTargetEdit(id, request); // guideline 02 per call
}`,
		measured: `Decomposition: 90 of 90 tasks and 674 of 674 subtasks, at a third of the single-prompt cost (<a class="${linkCls}" href="${dash}#sec-fanout">chart</a>). Write-up: <a class="${linkCls}" href="/blog/barkup-0-5-deterministic-selection">Your Code Finds the Targets Now</a>.`,
	},
	{
		id: "escape-hatch",
		eyebrow: "10 · The seatbelt · Study AC",
		title: "Give the model permission to ask",
		prose: [
			`Even with everything above in place, some request will eventually need a value the model cannot see. By default it will not tell you: across five studies of constructed missing-context tasks, models produced hundreds of valid, plausible, silently wrong edits and zero clarifying questions. Not because they could not see the gap. Given permission, every model named the exact missing node every time.`,
			`The permission costs one sentence. With it, every model asked on every provably-unsolvable task (270 of 270, against 0 of 270 without), and never once asked when it already had what it needed. An ask_user tool performed identically, so the sentence is the whole fix. Two obligations come with it: wire the reply to an actual UI path (a question that dead-ends is worse than a correction loop), and keep guidelines 02, 05, and 07 anyway. The hatch is a seatbelt; making the question unnecessary is still strictly better than making it possible.`,
			`Calibration is measured, not hoped (Study AE): across a five-level ambiguity ladder the sentence produced zero false asks on 90 clear requests, models edit "make it punchier" rather than interviewing anyone, and the full ask, answer, patch loop closed 135 of 135 from a plain-text reply, so the wired path will actually get used. One tier fence: when a request matches two visible nodes, only the frontier tier asks (opus 15 of 15, naming both ids); mid tiers silently edit both or pick one. Below the frontier, disambiguate app-side; the sentence covers what the model cannot see, not what it sees twice.`,
		],
		code: `If the request requires a value or a node that is not visible in the
view and not stated in the request, do NOT guess: reply with a single
line "NEED-INFO: <what is missing and where you would need to read
it>" instead of a patch.`,
		codeCaption: "The registered sentence, verbatim.",
		measured: `Asks on unsolvable tasks: 270 of 270 with the sentence, 0 of 270 without; false asks on solvable twins: zero in 270 (<a class="${linkCls}" href="${dash}#sec-ask">chart</a>); calibration ladder: zero false asks in 90 clear-request cells, resume loop 135 of 135, ambiguity detection frontier-only (<a class="${linkCls}" href="${dash}#sec-calibration">chart</a>). Write-ups: <a class="${linkCls}" href="/blog/the-model-always-knew">The Model Always Knew What It Couldn't See</a> and <a class="${linkCls}" href="/blog/only-the-frontier-knows-when-to-ask">Only the Frontier Knows When to Ask</a>.`,
	},
];
</script>

<div
  class="page-x-padding main-y-padding grid grid-cols-1 gap-12 min-h-screen place-content-start"
>
  <div class="text-16px leading-[1.55] text-white max-w-[1060px] pb-6">
    <header class="max-w-[56rem]">
      <p class={eyebrowCls}>
        <a class="hover:underline underline-offset-3" href={dash}
          >barkup-bench</a
        > · practical applications
      </p>
      <h1 class="display">The Builder's Playbook</h1>
      <p class="text-16px {proseCls} mb-4 mt-4">
        Ten guidelines for building document-editing apps with LLM agents,
        distilled from {researchStats.studiesSpelled} pre-registered studies
        and more than {researchStats.scoredRunsDisplay} scored model runs.
        Each one is an action you can take this week, with the measurement
        that earned it a place on the list and a link to its chart on the
        <a class={linkCls} href={dash}>research dashboard</a>.
      </p>
      <p class="text-16px {proseCls}">
        The whole architecture follows from one finding: the model is a
        brilliant executor with no context of its own, and when context is
        missing it does not fail loudly. It fills the gap with something
        plausible and moves on. So the division of labor is fixed. The
        application owns the context; the model owns the edit. Hand it
        everything the request assumes, and almost nothing else.
      </p>
      <p class="text-16px {proseCls} mt-4">
        A July 2026 note on model tiers: the core of this list (patches,
        views, search, the session recipes) was re-run end to end on
        claude-opus-4.8, the tier our own surfaces ship, with every gate
        passing at or above the prior bands (<a
          class={linkCls}
          href="{dash}#sec-opus">Study AD</a
        >). The guidelines below hold from the budget tiers to the
        frontier; the tier-dependent nuances are noted on guidelines 04
        and 10.
      </p>
    </header>

    {#each plays as play}
      <section class="mt-12" id={play.id}>
        <p class={eyebrowCls}>{play.eyebrow}</p>
        <h2 class="text-[1.22rem] font-600 tracking-[-0.01em] mb-2.5">
          {play.title}
        </h2>
        {#each play.prose as paragraph}
          <p class="text-16px {proseCls} mb-3">
            {@html paragraph}
          </p>
        {/each}
        {#if play.code}
          <pre class="{codeCls} max-w-[56rem] mt-4 mb-2">{play.code}</pre>
          {#if play.codeCaption}
            <p class="text-13px text-[#c3c9d4] opacity-80 max-w-[56rem] mb-3">
              {play.codeCaption}
            </p>
          {/if}
        {/if}
        <p class="text-14px {proseCls} mt-3 border-l-2 border-maximumYellow/40 pl-3.5">
          <span class="font-mono text-12px tracking-[0.1em] uppercase text-maximumYellow">Measured</span
          >&nbsp; {@html play.measured}
        </p>
      </section>
    {/each}

    <footer class="mt-14 pt-4.5 border-t border-white/14 text-15px {proseCls}">
      <p class="mb-4">
        Every guideline above was gated on a pre-registered study before it
        earned a place here, and everything it recommends ships in the
        open-source
        <a class={linkCls} href="https://www.npmjs.com/package/@kevinpeckham/barkup"
          >@kevinpeckham/barkup</a
        >
        package or as a documented pattern in the
        <a class={linkCls} href={repo}>benchmark repo</a>. The narrative
        version of this page, with the corrections and self-refutations that
        make the numbers trustworthy, is the capstone essay
        <a class={linkCls} href="/blog/hand-it-everything-it-needs"
          >Hand It Everything It Needs</a
        >. If you reproduce, extend, or refute any of this, we want the
        issue.
      </p>
      <div class="flex flex-wrap gap-3">
        <LinkButton
          classes="text-yellow-50"
          link={{ href: dash, title: "barkup-bench research dashboard" }}
        >
          The dashboard
        </LinkButton>
        <LinkButton
          classes="text-yellow-50"
          link={{ href: repo, title: "barkup-bench on GitHub" }}
        >
          The repo
        </LinkButton>
      </div>
    </footer>
  </div>
</div>
