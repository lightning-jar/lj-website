<script lang="ts">
import { onMount } from "svelte";

// components
import FeedBadge from "$components/FeedBadge.svelte";
import LinkButton from "$components/LinkButton.svelte";

// shared headline numbers: src/lib/data/research-stats.json
import researchStats from "$data/research-stats.json";

// dashboard content and chart data
import bench from "./bench-content.json";
import benchStudies from "./bench-studies.json";

// props
let { data } = $props();

// Track-grouped study index (insertion order of first appearance).
const tracks: { track: string; studies: typeof benchStudies.studies }[] = [];
for (const study of benchStudies.studies) {
	let group = tracks.find((t) => t.track === study.track);
	if (!group) {
		group = { track: study.track, studies: [] };
		tracks.push(group);
	}
	group.studies.push(study);
}

// Old deep links used #sec-* anchors on this page; those sections now
// live on per-study pages; forward them.
const movedAnchors = new Map(
	benchStudies.studies.flatMap((s) =>
		s.sections.map((sec) => [sec.id, s.slug] as const),
	),
);

onMount(async () => {
	const hash = location.hash.replace(/^#/, "");
	const moved = movedAnchors.get(hash);
	if (moved) {
		location.replace(`/research/barkup-bench/${moved}#${hash}`);
		return;
	}
	const { initBenchCharts } = await import("./bench-charts.js");
	initBenchCharts();
});

function formatDate(iso: string): string {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return "";
	return d.toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
		timeZone: "UTC",
	});
}

// shared dashboard styles
const eyebrowCls =
	"font-mono text-12px tracking-[0.14em] uppercase text-maximumYellow mb-1.5";
const proseCls = "text-[#c3c9d4]";
</script>

<svelte:head>
	<link
		rel="alternate"
		type="application/atom+xml"
		title="Barkup Bench research feed"
		href="/research/barkup-bench/atom.xml"
	/>
</svelte:head>

<main
  id="main"
  class="page-x-padding main-y-padding grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-x-12 gap-y-16 min-h-screen place-content-start"
>
  <!-- main column: article measure on small screens, widening as the
       viewport grows (charts stop needing horizontal scroll from xl up) -->
  <div
    class="max-w-none sm:max-w-[34rem] md:max-w-[38rem] lg:max-w-[42rem] xl:max-w-[48rem] 2xl:max-w-[56rem]"
  >
  <header>
    <div class="flex items-start justify-between gap-4">
      <h1 class="display">Barkup Bench</h1>
      <FeedBadge href="/research/barkup-bench/atom.xml" />
    </div>
    <p class="opacity-90 mb-4">
      Barkup Bench is our open research project measuring how large language
      models read and edit structured document trees. Every study is
      pre-registered: the hypotheses, task corpora, prompts, and analysis plan
      are committed to a public repository before a single model is called,
      and the results are published as found, corrections included.
    </p>
    <h2 class="text-[1.22rem] font-600 tracking-[-0.01em] mt-6 mb-1">
      The Findings in One Sentence
    </h2>
    <p class="opacity-90 mb-4">
      Give every node a stable id, never make the model reproduce anything it
      is not changing, and hand it everything the request assumes: the nodes
      it must read in the view, the goal it must satisfy in the memo.
      Everything the benchmark validated ships in the open-source barkup
      library, linked in the sidebar with the full article series below.
    </p>
  </header>

  <!-- results dashboard -->
  <div class="text-16px leading-[1.55] text-white pb-6">
    <header>
      <p class={eyebrowCls}>{@html bench.header.eyebrow}</p>
      <h2
        class="text-[1.55rem] font-600 tracking-[-0.015em] leading-[1.3] mb-2"
      >
          {@html bench.header.lede}
      </h2>
      {#each bench.header.intro as chunk (chunk.html)}
        {#if chunk.heading}
          <h3 class="text-[1.05rem] font-600 tracking-[-0.01em] mt-6 mb-1.5">
            {chunk.heading}
          </h3>
        {/if}
        <p class="text-16px {proseCls} mb-3">{@html chunk.html}</p>
      {/each}
      <h3
        class="text-[1.05rem] font-600 tracking-[-0.01em] mt-6 mb-1.5 pt-4 border-t border-white/14"
      >
        Methods &amp; Provenance
      </h3>
      <p class="text-16px {proseCls}">
        {@html bench.header.provenance}
      </p>
    </header>

    <div
      class="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-3 mt-7.5 mb-3.5"
    >
      {#each bench.tiles as tile}
        <div
          class="bg-[hsl(217,44%,19%)] border border-white/14 rounded-md px-4.5 pt-4 pb-3.5"
        >
          <div
            class="font-mono tabular-nums text-[1.85rem] font-700 leading-[1.1] tracking-[-0.01em]"
          >
            {@html tile.num}
          </div>
          <div class="text-[#c3c9d4] text-15px mt-1.5">
            {@html tile.cap}
          </div>
        </div>
      {/each}
    </div>

    {#each bench.sections as section}
      <section class="mt-11" id={section.id}>
        <p class={eyebrowCls}>{@html section.eyebrow}</p>
        <h2 class="text-[1.22rem] font-600 tracking-[-0.01em] mb-1">
          {@html section.title}
        </h2>
        <p class="text-16px {proseCls} mb-3.5">
          {@html section.takeaway}
        </p>
        {#if section.legendId}
          <div
            class="chart-legend"
            id={section.legendId}
          ></div>
        {/if}
        {#if section.figure}
          <!-- horizontally scrollable on narrow screens, so it must be
               keyboard-focusable with an accessible name
               (svelte a11y lint doesn't model scrollable regions) -->
          <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
          <div
            class="chart"
            id={section.figure.id}
            role="region"
            aria-label="Chart: {section.title}"
            tabindex="0"
          ></div>
        {/if}
        {#if section.table}
          <details class="mt-2.5">
            <summary
              class="table-summary"
            >
              {section.table.summary}
            </summary>
            <div class="data-table" id={section.table.id}></div>
          </details>
        {/if}
      </section>
    {/each}

    <section class="mt-14" id="studies">
      <p class={eyebrowCls}>The follow-up series · studies G–AO</p>
      <h2 class="text-[1.22rem] font-600 tracking-[-0.01em] mb-1">
        Every Study, One Page Each
      </h2>
      <p class="text-16px {proseCls} mb-6">
        The main study above set the baseline; everything since has been a
        pre-registered follow-up, each with its own charts, gates, and
        verdict. Grouped by theme, or
        <a
          href="/research/barkup-bench/atom.xml"
          class="underline decoration-maximumYellow/40 hover:decoration-maximumYellow underline-offset-4 hover:text-maximumYellow"
          >subscribe to the Atom feed</a
        > to hear about new studies as they publish:
      </p>
      {#each tracks as group (group.track)}
        <h3 class="font-mono text-[13px] tracking-[0.12em] uppercase text-maximumYellow mt-7 mb-2.5">
          {group.track}
        </h3>
        <ul class="grid grid-cols-1 gap-3">
          {#each group.studies as study (study.slug)}
            <li class="text-15px {proseCls}">
              <a
                href="/research/barkup-bench/{study.slug}"
                class="font-600 underline decoration-maximumYellow/40 hover:decoration-maximumYellow underline-offset-4 hover:text-maximumYellow"
              >
                Study {study.letters} · {study.title}
              </a>
              <span class="block text-14px text-[#c3c9d4] mt-0.5">
                {study.indexLine}
              </span>
            </li>
          {/each}
        </ul>
      {/each}
    </section>

    <footer
      class="mt-14 pt-4.5 border-t border-white/14 text-15px {proseCls}"
    >
      {@html bench.footer}
    </footer>
  </div>

  <section class="mt-14">
    <p class={eyebrowCls}>The article series · every post, in order</p>
    <h2 class="text-[1.22rem] font-600 tracking-[-0.01em] mb-1">
      The Full Series
    </h2>
    <p class="text-16px {proseCls} mb-6">
      Every post in the Barkup Bench series, in order. Start at the top for
      the whole story, or jump straight to the current capstone, Hand It
      Everything It Needs.
    </p>
    <ol class="grid grid-cols-1 gap-4 list-decimal list-outside pl-5">
      {#each data.articles as article}
        <li class="opacity-90">
          <a
            href="/blog/{article.slug}"
            class="underline decoration-maximumYellow/40 hover:decoration-maximumYellow underline-offset-4 hover:text-maximumYellow"
          >
            {article.title}
          </a>
          <span class="block text-13px opacity-70 font-mono">
            {formatDate(article.date)}
          </span>
        </li>
      {/each}
    </ol>
  </section>
  </div>

  <!-- sidebar -->
  <aside class="flex lg:justify-end">
    <div
      class="max-w-480px lg:w-[320px] xl:w-[360px] 2xl:w-[400px] grid grid-cols-1 gap-6 place-content-start"
    >
      <!-- headline stats: single source of truth is research-stats.json -->
      <div class="grid grid-cols-2 gap-3">
        {#each [
          { num: researchStats.barkupBench.studiesDisplay, cap: "pre-registered studies, published as found" },
          { num: researchStats.barkupBench.scoredRunsDisplay, cap: "scored model runs at temperature 0" },
          { num: researchStats.barkupBench.modelsDisplay, cap: "models measured across tiers" },
          { num: "1,000", cap: "nodes in the largest trees; sessions to 36 edits" },
        ] as tile (tile.cap)}
          <div
            class="bg-[hsl(217,44%,19%)] border border-white/14 rounded-md px-4.5 pt-4 pb-3.5"
          >
            <div
              class="font-mono tabular-nums text-[1.85rem] font-700 leading-[1.1] tracking-[-0.01em] text-maximumYellow"
            >
              {tile.num}
            </div>
            <div class="text-[#c3c9d4] text-15px mt-1.5">{tile.cap}</div>
          </div>
        {/each}
      </div>

      <!-- the Builder's Playbook tout -->
      <div
        class="border border-maximumYellow/30 bg-maximumYellow/5 rounded-md px-4.5 pt-4 pb-5"
      >
        <h3 class="font-serif font-700 text-17px text-maximumYellow mb-2">
          The Builder's Playbook
        </h3>
        <p class="opacity-90 mb-4">
          Building a document-editing app? The findings are distilled into
          ten action items with code examples.
        </p>
        <LinkButton
          classes="button-accent"
          link={{
            href: "/research/barkup-bench/playbook",
            title: "The Builder's Playbook",
          }}
        >
          Read the Playbook
        </LinkButton>
      </div>

      <!-- the packages -->
      <div
        class="w-full border border-slate-100/10 bg-slate-100/5 rounded px-3 pt-4 pb-5"
      >
        <h2
          class="font-mono text-13px tracking-[0.12em] uppercase text-maximumYellow mb-2"
        >
          The Packages
        </h2>
        <p class="opacity-90 text-14px mb-5">
          Open-source software generated in response to the research, all MIT
          licensed.
        </p>
        <div class="grid grid-cols-1 gap-6">
          {#each data.packages as pkg (pkg.name)}
            <article>
              <h3 class="font-mono text-16px text-maximumYellow mb-1.5">
                {pkg.name}
              </h3>
              <p class="opacity-90 text-14px leading-snug mb-3">
                {pkg.tagline}
              </p>
              <div class="flex flex-wrap gap-3">
                {#each pkg.links as link (link.href)}
                  <LinkButton
                    base="button-small"
                    classes="text-yellow-50"
                    link={{
                      href: link.href,
                      title: `${pkg.name} on ${link.label}`,
                    }}
                  >
                    {link.label}
                  </LinkButton>
                {/each}
              </div>
            </article>
          {/each}
        </div>
      </div>
    </div>
  </aside>
</main>

<!-- chart hover tooltip (positioned by bench-charts.js) -->
<div
  id="tooltip"
  aria-hidden="true"
  class="fixed pointer-events-none bg-[#fcfcfb] text-[#0b0b0b] font-mono text-[12px] leading-[1.45] px-2.5 py-[7px] rounded-[5px] max-w-[300px] opacity-0 transition-opacity duration-100 motion-reduce:transition-none z-10 whitespace-pre-wrap"
></div>
