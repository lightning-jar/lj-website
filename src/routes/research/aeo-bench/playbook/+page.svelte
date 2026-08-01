<script lang="ts">
// components
import LinkButton from "$components/LinkButton.svelte";

// shared headline numbers: src/lib/data/research-stats.json
import researchStats from "$data/research-stats.json";

// shared dashboard styles (mirrors /research/aeo-bench and the sibling
// Builder's Playbook so the two guidance pages read as one series)
const eyebrowCls =
	"font-mono text-12px tracking-[0.14em] uppercase text-maximumYellow mb-1.5";
const proseCls = "text-[#c3c9d4] max-w-[56rem]";
const linkCls = "text-maximumYellow hover:underline underline-offset-3";
const codeCls =
	"bg-[hsl(217,44%,19%)] border border-white/14 rounded-md px-4.5 py-4 overflow-x-auto font-mono text-13px leading-[1.6] text-[#dfe4ec] whitespace-pre";

// small labels near each title: how the finding relates to the prevailing
// advice, and how far the evidence actually reaches
const verdictCls =
	"font-mono text-11px tracking-[0.1em] uppercase text-oxford bg-maximumYellow rounded px-2 py-0.5";
const confidenceCls =
	"font-mono text-11px tracking-[0.1em] uppercase text-[#c3c9d4] border border-white/20 rounded px-2 py-0.5";

interface Guideline {
	id: string;
	part: "site" | "agent";
	eyebrow: string;
	title: string;
	// paragraphs; may contain inline html (links, <strong>)
	prose: string[];
	// rendered verbatim in a <pre>
	example?: string;
	exampleCaption?: string;
	// our relationship to the prevailing advice, and the epistemic tag
	verdict: string;
	confidence: string;
	// the numbers plus study/essay links (inline html)
	evidence: string;
}

const dash = "/research/aeo-bench";
const repo = "https://github.com/kevinpeckham/aeo-bench";
const cloudflare = "https://blog.cloudflare.com/agent-readiness/";

const guidelines: Guideline[] = [
	{
		id: "link-your-content",
		part: "site",
		eyebrow: "01 · If you own a website · Study 2",
		title: "Link the content you want agents to reach",
		verdict: "Overturns the reflex",
		confidence: "Measured",
		prose: [
			`The prevailing advice says publish <a class="${linkCls}" href="https://llmstxt.org">llms.txt</a> and sitemap.xml so agents can discover your pages. We built a 300-page site where twelve pages that mattered (product recalls, safety bulletins, rebate terms) were listed in sitemap.xml and every llms.txt variant but linked from no page at all, then asked agents about them. Every model scored 0 of 10 on those pages in every file-bearing arm, because nothing read the files.`,
			`The failure is worse than not finding the page. Agents did not report the content as unreachable. They authoritatively declared it did not exist, 148 times out of 150, through a structured answer channel, after exhausting their search budget. If a fact matters and an agent should find it, a discovery-file listing will not surface it. A link will. This is the single most actionable thing a site owner can do.`,
		],
		evidence: `Orphan pages: 0 of 10 in every file-bearing arm; unreachable facts declared nonexistent 148 of 150 times (<a class="${linkCls}" href="${dash}/2">Study 2</a>). Write-up: <a class="${linkCls}" href="/blog/nobody-reads-llms-txt">Nobody Reads llms.txt (Yet)</a>.`,
	},
	{
		id: "serve-markdown",
		part: "site",
		eyebrow: "02 · If you own a website · Study 1",
		title: "Serve markdown: content negotiation plus .md fallbacks",
		verdict: "Confirmed, overstated",
		confidence: "Measured",
		prose: [
			`<a class="${linkCls}" href="${cloudflare}">Cloudflare's proposal</a> includes markdown content negotiation: serve a clean .md version of a page to agents that ask for it, with a headline claim of up to 80% token savings. The ceiling is real, but the average is not. The saving is proportional to how wasteful the agent was to begin with. A chatty model fell to about 26 to 27% of its own baseline input cost, roughly the claimed saving. A frugal model fell only to 80 to 83%, about 20%, because it was not wasting much to start with.`,
			`Ship it anyway. We measured zero downside and a genuine saving for the agents that need it most. One caveat you cannot control from the server: sending the markdown request at all is a model disposition, not a guarantee. One frontier model discovered the pathway 64% of the time from a hidden hint; another essentially never did.`,
		],
		evidence: `Input cost fell to 26 to 27% of baseline for a wasteful agent, only 80 to 83% for a frugal one; zero measured downside (<a class="${linkCls}" href="${dash}/1">Study 1</a>). The up-to-80% claim is confirmed at the wasteful end and overstated as an average.`,
	},
	{
		id: "publish-the-files",
		part: "site",
		eyebrow: "03 · If you own a website · Studies 1 and 2",
		title: "Publish the discovery files, but expect nothing from them today",
		verdict: "Overturns the reflex",
		confidence: "Measured now; future-study candidate",
		prose: [
			`llms.txt and sitemap.xml are the two files most agent-readiness checklists lead with. Across 900 agent runs on a well-linked site, no model fetched either one even once. On the site rebuilt so the files were the only path to the answers, unprompted consultation stayed near zero: out of 128 chances per model, the frontier tier consulted a present file zero times, and the best-behaved compliant model just once.`,
			`They are not harmful. Keep them for crawlers and for the product layer that may one day consume them. But do not expect them to help an agent at the model layer today, and do not treat shipping them as having done the work. This is the guideline most likely to age: the files are fine, the readers are missing, and harnesses could start reading them next quarter. That is exactly why it is a registered candidate for future study rather than a permanent verdict.`,
		],
		evidence: `Discovery-file consultation: 0 across 900 runs unprompted, near-zero even when the files were the only path (opus 0 of 128) (<a class="${linkCls}" href="${dash}/1">Study 1</a>, <a class="${linkCls}" href="${dash}/2">Study 2</a>). MCP server cards later scored the same zero (<a class="${linkCls}" href="${dash}/4">Study 4</a>): three well-known file classes, one law.`,
	},
	{
		id: "write-for-substance",
		part: "site",
		eyebrow: "04 · If you own a website · Google's guidance",
		title: "Write for substance, not tricks",
		verdict: "Convergent",
		confidence: "Not our measurement",
		prose: [
			`<a class="${linkCls}" href="https://developers.google.com/search/docs/fundamentals/using-gen-ai-content">Google's own guidance</a> points away from a technique checklist. It judges content by utility and authenticity, not by how it was produced, and it deliberately declines to publish a list of optimization tactics. That lines up with the flattest result we found: on a navigable site, no retrieval aid improved correctness for any model, because finding facts was never the bottleneck. Every model answered present-class questions at or near a perfect score from plain HTML with no aids at all.`,
			`The uncomfortable implication for the AEO industry is that there is no tactic that beats being genuinely useful and genuinely reachable. The files and the negotiation headers are plumbing. The substance is the product.`,
		],
		evidence: `Correctness saturated: perfect or near-perfect present-class scores in every arm including bare HTML, so no aid could improve a ceiling (<a class="${linkCls}" href="${dash}/1">Study 1</a>). Convergent with Google Search's position that content is judged by utility, not production method. Not our measurement.`,
	},
	{
		id: "affordance-sentence",
		part: "agent",
		eyebrow: "05 · If you build the agent · Study 2",
		title: "Tell your fetch tool the index exists",
		verdict: "Confirmed",
		confidence: "Measured",
		prose: [
			`If discovery is the missing link and it lives in the harness, the cheapest possible fix is to tell the harness the index is there. We added a single sentence to the fetch tool's description, saying machine-readable indexes may exist, and changed nothing else about the site.`,
			`Orphan-task success went from 0 of 10 to as many as 10 of 10 on the frontier tier. Blind URL path-guessing collapsed; one model went from 43 guessed 404s to zero. This is the highest-leverage sentence the whole series found, and it is one line in a tool description.`,
		],
		example: `You have a fetch tool for this site. Machine-readable indexes may
exist at well-known paths such as /llms.txt or /sitemap.xml. If you
cannot reach something by following links, fetch one of those first.`,
		exampleCaption:
			"The shape of the affordance, illustrative. The exact registered wording lives in the aeo-bench repo.",
		evidence: `Orphan tasks: 0 of 10 without the sentence, up to 10 of 10 with it; path-guessing collapsed (one model 43 guesses to 0) (<a class="${linkCls}" href="${dash}/2">Study 2</a>). Write-up: <a class="${linkCls}" href="/blog/one-sentence-beats-every-file">One Sentence Beats Every File</a>.`,
	},
	{
		id: "prefetch-curated-index",
		part: "agent",
		eyebrow: "06 · If you build the agent · Study 3 · first gate PASS",
		title: "Prefetch a curated site index into context",
		verdict: "Confirmed",
		confidence: "Measured",
		prose: [
			`The affordance sentence hopes the model goes and gets the index. Prefetching hands it over. We measured four designs on the same fixture: the hint, a dedicated read-the-index tool, prefetching a curated index into the system context, and prefetching the giant everything-index. All of them solved the orphan class completely. The difference was cost.`,
			`On the candidate model, Haiku 4.5, input tokens per solved task fell from 68.9k unaided to 41.3k under the hint, 13.5k with an index tool, and 9.4k with the curated index prefetched into context: over seven times cheaper than unaided, and 4.4 times cheaper than the hint, at equal or better accuracy. The prefetch also rides the cacheable part of the system prompt, where a tool call never can. This site's own concierge ships exactly this design, and it was the first pre-registered gate in the series to pass outright.`,
		],
		example: `const system = [
	{
		role: "system",
		content: instructions + curatedSiteIndex, // static
		providerOptions: {
			anthropic: { cacheControl: { type: "ephemeral" } },
		},
	},
	{ role: "system", content: perRequestContext }, // per-request tail
];`,
		exampleCaption:
			"The curated index rides the static, cacheable block; a fetched index cannot. This is the layout the lj-website concierge ships.",
		evidence: `Input tokens per solved task on Haiku 4.5: 68.9k unaided, 41.3k hint, 13.5k index tool, 9.4k curated prefetch, at equal or better accuracy (<a class="${linkCls}" href="${dash}/3">Study 3</a>). The series' first registered gate PASS.`,
	},
	{
		id: "mount-capabilities",
		part: "agent",
		eyebrow: "07 · If you build the agent · Study 4",
		title: "Mount capabilities as tools, do not just advertise them",
		verdict: "Confirmed",
		confidence: "Measured",
		prose: [
			`Cloudflare's proposal ends with capabilities: let agents do things, advertised through MCP server cards at a well-known path. The card was consulted zero times unprompted, by every model, the same universal zero as llms.txt and sitemap.xml. But the sharper finding is about what happens even when the model already knows the endpoint exists.`,
			`Given full knowledge of both a normal page and a structured API for the same data, every model still answered every product question from the page, 0 of 24 through the API, reserving structured calls only for orders it could get no other way. Knowing an endpoint exists changed nothing. Mounting it as a harness tool changed everything, and it made the surface cheaper: mean input per task fell from 51.4k tokens to 9.5k, a 5.4 times cut. If you want an agent to use a capability, hand it the tool. Do not publish a card and hope.`,
		],
		evidence: `Server card consulted 0 times unprompted (the third well-known file class to score a universal zero); with both endpoints known, 0 of 24 product lookups used the API until the endpoints were mounted as tools; mounting cut mean input 5.4 times (<a class="${linkCls}" href="${dash}/4">Study 4</a>).`,
	},
	{
		id: "curated-slice",
		part: "agent",
		eyebrow: "08 · If you build the agent · Study 3",
		title: "Serve a curated slice, not the everything-file",
		verdict: "Confirmed",
		confidence: "Measured",
		prose: [
			`Cloudflare flags a real hazard: an oversized index that agents grep-loop through, burning tokens. Twice the series tried to measure it and could not, because nothing consulted the files at all. With prefetch, consultation is total by construction, and the verdict is clean. The giant everything-index bought nothing over a curated slice, zero additional orphan tasks solved, and cost 2.68 times the input.`,
			`So the hazard is real, but it is a token tax, not a behavior failure; models read a prefetched index once rather than grepping it. If you maintain a large index, including a site whose public llms.txt runs to 150 entries, keep the full file public for crawlers and serve the agent a curated slice of what matters.`,
		],
		evidence: `Giant everything-index versus curated slice: zero orphan-task delta, 2.68 times the input cost, and no grep-loop pathology under prefetch (<a class="${linkCls}" href="${dash}/3">Study 3</a>).`,
	},
];

const siteGuidelines = guidelines.filter((g) => g.part === "site");
const agentGuidelines = guidelines.filter((g) => g.part === "agent");
</script>

<main
  id="main"
  class="page-x-padding main-y-padding grid grid-cols-1 gap-12 min-h-screen place-content-start"
>
  <div class="text-16px leading-[1.55] text-white max-w-[1060px] pb-6">
    <header class="max-w-[56rem]">
      <p class={eyebrowCls}>
        <a class="hover:underline underline-offset-3" href={dash}>aeo-bench</a> ·
        practical applications
      </p>
      <h1 class="heading-1">The Agent-Readiness &amp; AEO Playbook</h1>
      <p class="text-16px {proseCls} mb-4 mt-4">
        <a class={linkCls} href={cloudflare}>Cloudflare's agent-readiness
        proposal</a> is the most concrete menu anyone has published for making a
        website legible to AI agents: markdown content negotiation, llms.txt,
        sitemap.xml, and MCP server cards. We built AEO Bench to measure it.
        This page is the result stated as advice you can act on, drawn from {researchStats
          .aeoBench.studiesSpelled} pre-registered studies and {researchStats
          .aeoBench.scoredRunsDisplay} scored agent runs across {researchStats
          .aeoBench.modelsSpelled} models. Each guideline names the prevailing
        recommendation, then tags our relationship to it and how far the
        evidence actually reaches, with a link to the study that earned it.
      </p>
      <p class="text-16px {proseCls}">
        One finding runs through all four studies and reorganizes the whole
        list: the website is not where the lever is. Sites should publish their
        files and, above all, link their content. But almost every technique
        that moved a number moved it on the agent's side of the wire, in the
        harness that decides what the model gets to see. So Part One is what a
        site owner controls, and Part Two is where the real lever is.
      </p>
      <p class="text-16px {proseCls} mt-4">
        A caveat that belongs at the top, not the bottom. Agent readiness is
        not a settled science. These techniques are guesses at standards that
        have not converged and at behaviors models may or may not adopt as they
        change. We measured what we could, pre-registered every hypothesis
        before running it, and published the corrections. Treat the measured
        items as true of the models we tested in mid-2026, not as laws. Anyone
        who tells you they know the exact combination that works today and will
        keep working tomorrow is selling something.
      </p>
    </header>

    <h2
      class="text-[1.4rem] font-700 tracking-[-0.01em] mt-14 pt-5 border-t border-white/14"
    >
      Part One · If you own a website
    </h2>
    <p class="text-15px {proseCls} mt-1.5">
      The levers a site operator actually controls. The honest news is that the
      ceiling here is low: the files are mostly unread today, and the strongest
      move is the least technical one.
    </p>

    {#each siteGuidelines as g (g.id)}
      <section class="mt-11" id={g.id}>
        <p class={eyebrowCls}>{g.eyebrow}</p>
        <h3 class="text-[1.22rem] font-600 tracking-[-0.01em] mb-2">
          {g.title}
        </h3>
        <div class="flex flex-wrap gap-2 mb-3">
          <span class={verdictCls}>{g.verdict}</span>
          <span class={confidenceCls}>{g.confidence}</span>
        </div>
        {#each g.prose as paragraph}
          <p class="text-16px {proseCls} mb-3">
            {@html paragraph}
          </p>
        {/each}
        {#if g.example}
          <pre class="{codeCls} max-w-[56rem] mt-4 mb-2">{g.example}</pre>
          {#if g.exampleCaption}
            <p class="text-13px text-[#c3c9d4] opacity-80 max-w-[56rem] mb-3">
              {g.exampleCaption}
            </p>
          {/if}
        {/if}
        <p
          class="text-14px {proseCls} mt-3 border-l-2 border-maximumYellow/40 pl-3.5"
        >
          <span
            class="font-mono text-12px tracking-[0.1em] uppercase text-maximumYellow"
            >Evidence</span
          >&nbsp; {@html g.evidence}
        </p>
      </section>
    {/each}

    <h2
      class="text-[1.4rem] font-700 tracking-[-0.01em] mt-14 pt-5 border-t border-white/14"
    >
      Part Two · If you build the agent
    </h2>
    <p class="text-15px {proseCls} mt-1.5">
      Where the real lever is. Every item below moved a number on the reader's
      side of the wire, in the harness, not the website.
    </p>

    {#each agentGuidelines as g (g.id)}
      <section class="mt-11" id={g.id}>
        <p class={eyebrowCls}>{g.eyebrow}</p>
        <h3 class="text-[1.22rem] font-600 tracking-[-0.01em] mb-2">
          {g.title}
        </h3>
        <div class="flex flex-wrap gap-2 mb-3">
          <span class={verdictCls}>{g.verdict}</span>
          <span class={confidenceCls}>{g.confidence}</span>
        </div>
        {#each g.prose as paragraph}
          <p class="text-16px {proseCls} mb-3">
            {@html paragraph}
          </p>
        {/each}
        {#if g.example}
          <pre class="{codeCls} max-w-[56rem] mt-4 mb-2">{g.example}</pre>
          {#if g.exampleCaption}
            <p class="text-13px text-[#c3c9d4] opacity-80 max-w-[56rem] mb-3">
              {g.exampleCaption}
            </p>
          {/if}
        {/if}
        <p
          class="text-14px {proseCls} mt-3 border-l-2 border-maximumYellow/40 pl-3.5"
        >
          <span
            class="font-mono text-12px tracking-[0.1em] uppercase text-maximumYellow"
            >Evidence</span
          >&nbsp; {@html g.evidence}
        </p>
      </section>
    {/each}

    <footer class="mt-14 pt-4.5 border-t border-white/14 text-15px {proseCls}">
      <p class="mb-4">
        Every guideline here was gated on a pre-registered study before it
        earned its place, and the techniques under test are the ones proposed
        in <a class={linkCls} href={cloudflare}>Cloudflare's agent-readiness
        post</a>. The pattern underneath all eight is the same: sites should
        publish the files and, above all, link the content; the lever lives in
        the reader's harness. Publish the files, mount the readers. If you
        reproduce, extend, or refute any of this, we want the issue.
      </p>
      <div class="flex flex-wrap gap-3">
        <LinkButton
          classes="text-yellow-50"
          link={{ href: dash, title: "AEO Bench research dashboard" }}
        >
          The dashboard
        </LinkButton>
        <LinkButton
          classes="text-yellow-50"
          link={{ href: repo, title: "aeo-bench on GitHub" }}
        >
          The repo
        </LinkButton>
      </div>
    </footer>
  </div>
</main>
