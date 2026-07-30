<script lang="ts">
// shared headline numbers: src/lib/data/research-stats.json

import { onMount } from "svelte";

// components
import FeedBadge from "$components/FeedBadge.svelte";
import LinkButton from "$components/LinkButton.svelte";

import researchStats from "$data/research-stats.json";

// dashboard content and chart data
import aeo from "./aeo-content.json";
import aeoStudies from "./aeo-studies.json";

// props
let { data } = $props();

// Track-grouped study index (insertion order of first appearance).
const tracks: { track: string; studies: typeof aeoStudies.studies }[] = [];
for (const study of aeoStudies.studies) {
	let group = tracks.find((t) => t.track === study.track);
	if (!group) {
		group = { track: study.track, studies: [] };
		tracks.push(group);
	}
	group.studies.push(study);
}

// Deep links to #sec-* anchors belong to per-study pages; forward them.
const movedAnchors = new Map(
	aeoStudies.studies.flatMap((s) =>
		s.sections.map((sec) => [sec.id, s.slug] as const),
	),
);

onMount(async () => {
	const hash = location.hash.replace(/^#/, "");
	const moved = movedAnchors.get(hash);
	if (moved) {
		location.replace(`/research/aeo-bench/${moved}#${hash}`);
		return;
	}
	const { initAeoCharts } = await import("./aeo-charts.js");
	initAeoCharts();
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
		title="AEO Bench research feed"
		href="/research/aeo-bench/atom.xml"
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
      <h1 class="display">AEO Bench</h1>
      <FeedBadge href="/research/aeo-bench/atom.xml" />
    </div>
    <p class="opacity-90 mb-4">
      Can your website be read by an AI agent, and do the techniques that
      promise to help actually work? AEO Bench is our open, pre-registered
      benchmark for agent readiness and answer-engine optimization: controlled
      site fixtures with real HTTP semantics, seeded questions with known
      answers, mechanical grading, and token cost as a first-class outcome.
    </p>
    <p class="opacity-90 mb-4">
      Study 1 measured the retrieval-class techniques from Cloudflare's
      agent-readiness proposal (llms.txt, sitemap.xml, and markdown content
      negotiation) on a well-linked site; Study 2 rebuilt the site so
      discovery files were the only path to the answers. Together: 1,860
      scored agent runs across five models. Hypotheses, corpora, and graders
      are committed before any scored run; results are published as found,
      corrections included.
    </p>
  </header>

  <!-- results dashboard -->
  <div class="text-16px leading-[1.55] text-white pb-6">
    <header>
      <h3
        class="text-[1.05rem] font-600 tracking-[-0.01em] mt-6 mb-1.5 pt-4 border-t border-white/14"
      >
        Methods &amp; Provenance
      </h3>
      <p class="text-16px {proseCls}">
        {@html aeo.provenance}
      </p>
    </header>

    <section class="mt-14" id="studies">
      <p class={eyebrowCls}>The study series · study 1 + registered re-score</p>
      <h2 class="text-[1.22rem] font-600 tracking-[-0.01em] mb-1">
        Every Study, One Page Each
      </h2>
      <p class="text-16px {proseCls} mb-6">
        Every study is pre-registered before its first scored run and gets its
        own page with charts, tables, and a verdict. Study 1′, the registered
        corrected-grader re-score, is reported alongside Study 1. Grouped by
        theme:
      </p>
      {#each tracks as group (group.track)}
        <h3 class="font-mono text-[13px] tracking-[0.12em] uppercase text-maximumYellow mt-7 mb-2.5">
          {group.track}
        </h3>
        <ul class="grid grid-cols-1 gap-3">
          {#each group.studies as study (study.slug)}
            <li class="text-15px {proseCls}">
              <a
                href="/research/aeo-bench/{study.slug}"
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
      {@html aeo.footer}
    </footer>
  </div>

  {#if data.articles.length}
    <section class="mt-14">
      <p class={eyebrowCls}>The article series · every post, in order</p>
      <h2 class="text-[1.22rem] font-600 tracking-[-0.01em] mb-1">
        The Full Series
      </h2>
      <p class="text-16px {proseCls} mb-6">
        Every post in the AEO Bench series, in order. Start at the top for the
        whole story, or jump straight to the latest study writeup.
      </p>
      <ol class="grid grid-cols-1 gap-4 list-decimal list-outside pl-5">
        {#each data.articles as article (article.slug)}
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
  {/if}
  </div>

  <!-- sidebar -->
  <aside class="flex lg:justify-end">
    <div
      class="max-w-480px lg:w-[320px] xl:w-[360px] 2xl:w-[400px] grid grid-cols-1 gap-6 place-content-start"
    >
      <!-- headline stats -->
      <div class="grid grid-cols-2 gap-3">
        {#each [
          { num: researchStats.aeoBench.studiesDisplay, cap: "pre-registered studies, plus a registered re-score" },
          { num: researchStats.aeoBench.scoredRunsDisplay, cap: "scored agent runs at temperature 0" },
          { num: researchStats.aeoBench.modelsDisplay, cap: "models measured across tiers" },
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

<!-- chart hover tooltip (positioned by aeo-charts.js) -->
<div
  id="tooltip"
  aria-hidden="true"
  class="fixed pointer-events-none bg-[#fcfcfb] text-[#0b0b0b] font-mono text-[12px] leading-[1.45] px-2.5 py-[7px] rounded-[5px] max-w-[300px] opacity-0 transition-opacity duration-100 motion-reduce:transition-none z-10 whitespace-pre-wrap"
></div>
