<script lang="ts">
import { onMount } from "svelte";

// components
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
const proseCls = "text-[#c3c9d4] max-w-[56rem]";
</script>

<svelte:head>
	<link
		rel="alternate"
		type="application/atom+xml"
		title="barkup-bench research feed"
		href="/research/barkup-bench/atom.xml"
	/>
</svelte:head>

<div
  class="page-x-padding main-y-padding grid grid-cols-1 gap-12 min-h-screen place-content-start"
>
  <header class="max-w-article">
    <h1 class="display">barkup-bench</h1>
    <p class="opacity-90 mb-4">
      barkup-bench is our open research project measuring how large language
      models read and edit structured document trees. Every study is
      pre-registered: the hypotheses, task corpora, prompts, and analysis plan
      are committed to a public repository before a single model is called,
      and the results are published as found, corrections included.
    </p>
    <p class="opacity-90 mb-4">
      The series so far: {researchStats.studiesSpelled} studies, more than
      {researchStats.scoredRunsDisplay} scored model runs,
      {researchStats.modelsSpelled} models, trees from 5 to 1,000 nodes, and
      editing sessions up to 36 edits long. The findings compress to one sentence: give every node
      a stable id, never make the model reproduce anything it is not changing,
      and hand it everything the request assumes: the nodes it must read in
      the view, the goal it must satisfy in the memo. Everything the benchmark
      validated ships in the open-source barkup library, linked below with the
      full article series.
    </p>
    <p
      class="border border-maximumYellow/30 bg-maximumYellow/5 rounded-md px-4.5 py-3.5 opacity-90"
    >
      Building a document-editing app? The findings are distilled into ten
      action items with code examples in
      <a
        href="/research/barkup-bench/playbook"
        class="text-maximumYellow hover:underline underline-offset-3 font-600"
        >The Builder's Playbook</a
      >.
    </p>
  </header>

  <!-- results dashboard -->
  <div class="text-16px leading-[1.55] text-white max-w-[1060px] pb-6">
    <header class="max-w-[56rem]">
      <p class={eyebrowCls}>{@html bench.header.eyebrow}</p>
      <h2
        class="text-[1.55rem] font-600 tracking-[-0.015em] leading-[1.3] mb-2"
      >
          {@html bench.header.lede}
      </h2>
      {#each bench.header.intro as paragraph}
        <p class="text-16px {proseCls} mb-3">{@html paragraph}</p>
      {/each}
      <p class="text-16px {proseCls} mt-5 pt-4 border-t border-white/14">
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
            class="flex flex-wrap gap-x-4.5 gap-y-2 mb-2.5 text-14px text-[#c3c9d4]"
            id={section.legendId}
          ></div>
        {/if}
        {#if section.figure}
          <div
            class="overflow-x-auto font-mono tabular-nums mt-5 mb-5 bg-white/5"
            id={section.figure.id}
          ></div>
        {/if}
        {#if section.table}
          <details class="mt-2.5">
            <summary
              class="cursor-pointer select-none text-[#c3c9d4] text-14px"
            >
              {section.table.summary}
            </summary>
            <div id={section.table.id}></div>
          </details>
        {/if}
      </section>
    {/each}

    <section class="mt-14" id="studies">
      <p class={eyebrowCls}>The follow-up series · studies G–AO</p>
      <h2 class="text-[1.22rem] font-600 tracking-[-0.01em] mb-1">
        Every study, one page each
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

  <section class="max-w-article">
    <h2 class="heading-2">The Packages</h2>
    <p class="opacity-90 mb-6">
      Open-source software generated in response to the research, all MIT
      licensed.
    </p>
    <div class="grid grid-cols-1 gap-8">
      {#each data.packages as pkg}
        <article>
          <h3 class="font-mono text-18px text-maximumYellow mb-2">
            {pkg.name}
          </h3>
          <p class="opacity-90 mb-3">{pkg.tagline}</p>
          <div class="flex flex-wrap gap-3">
            {#each pkg.links as link}
              <LinkButton
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
  </section>

  <section class="max-w-article">
    <h2 class="heading-2">The Full Series</h2>
    <p class="opacity-90 mb-6">
      Every post in the barkup-bench series, in order. Start at the top for
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

<!-- chart hover tooltip (positioned by bench-charts.js) -->
<div
  id="tooltip"
  aria-hidden="true"
  class="fixed pointer-events-none bg-[#fcfcfb] text-[#0b0b0b] font-mono text-[12px] leading-[1.45] px-2.5 py-[7px] rounded-[5px] max-w-[300px] opacity-0 transition-opacity duration-100 motion-reduce:transition-none z-10 whitespace-pre"
></div>
