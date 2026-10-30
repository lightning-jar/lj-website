<script lang="ts">
// shared headline numbers: src/lib/data/research-stats.json

import { onMount } from "svelte";

// components
import LinkButton from "#lib/components/LinkButton.svelte";

import researchStats from "#lib/data/research-stats.json";

// dashboard content and chart data
import stem from "./stem-content.json";
import stemStudies from "./stem-studies.json";

// props
let { data } = $props();

// Track-grouped study index (insertion order of first appearance).
const tracks: { track: string; studies: typeof stemStudies.studies }[] = [];
for (const study of stemStudies.studies) {
	let group = tracks.find((t) => t.track === study.track);
	if (!group) {
		group = { track: study.track, studies: [] };
		tracks.push(group);
	}
	group.studies.push(study);
}

// Deep links to #sec-* anchors belong to per-study pages; forward them.
const movedAnchors = new Map(
	stemStudies.studies.flatMap((s) =>
		s.sections.map((sec) => [sec.id, s.slug] as const),
	),
);

onMount(async () => {
	const hash = location.hash.replace(/^#/, "");
	const moved = movedAnchors.get(hash);
	if (moved) {
		location.replace(`/research/stem-bench/${moved}#${hash}`);
		return;
	}
	const { initStemCharts } = await import("./stem-charts.js");
	initStemCharts();
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
    <h1 class="heading-1">Stem Bench</h1>
    <p class="opacity-90 mb-4">
      When a production app ships a feature built on a language model, the
      design decisions inside it are empirical claims: which model, which
      prompt scaffolding, whether a heuristic hint helps or hurts. Stem Bench
      is our open, pre-registered benchmark series measuring those decisions
      in <a
        href="https://www.stemshovel.com"
        class="underline decoration-maximumYellow/40 hover:decoration-maximumYellow underline-offset-4 hover:text-maximumYellow"
        >Stem Shovel</a
      >, Lightning Jar's music collaboration app: deterministic fixtures with
      ground truth by construction, production-pinned prompts and pipelines,
      mechanical grading, and spend fences.
    </p>
    <p class="opacity-90 mb-4">
      Study 1 measured the chart-draft pipeline: when the model reads a noisy
      music transcription with a free template matcher's chord guess riding
      along as a hint, does it read the notes or copy the hint? Study 2
      measured the reasoning-off claim hard-coded in the Text-to-Beat
      feature, and found the claim holds for the shipped model while the
      call shape itself is not portable across models. Study 3 asked whether
      a model can read sheet music at all, as a Verovio round trip with
      every fact known by construction. Study 4 asked whether the
      listening-layer song check hears what it claims to hear, and found a
      text channel wearing headphones. Study 5 composed the reader with the
      listener, caught a fixture confound that forced a dated correction to
      Study 3, and measured a chain that adds nothing of its own. Study 6
      validated the production warning heuristic that correction produced,
      at zero model spend. Study 7 re-measured the song check Stem Shovel
      rebuilt in response to Study 4, and the deference failure is closed.
      Study 8 ran the loophole test on the last unmeasured feature and
      recorded the program's first genuine listening result: they hear
      texture, not form. Study 6b closed the program's longest loop:
      the production agent registered its own validation of the rule it
      shipped, and the bench ran it unmodified to a perfect sheet. And
      Study 9 answered the app's own stem-aware question with zero-cost
      instruments, and Study 10 gave the shipped detector its neural
      rematch on both home fields: the classical code held its ground,
      and the one reversal corrected Study 9's own suggestion. Study 11
      then retired the detector's octave error class by representation,
      with a tempo ladder that accepted zero genuinely wrong values in
      255 rows, Study 11b validated the shipped ladder itself, and
      Study 11c closed the thread: the patched gate validated, and the
      bench's own proposed rule was retired on the record by the defeat
      it registered in advance. Study 12 closed the arc itself,
      taking the model's last hearing job with chart-render alignment
      that places boundaries to the hundredth of a second. 3,329 scored
      cells across seven models so far.
      Hypotheses, corpora, and graders are committed before any scored
      run; results are published as found, gate letters and corrections
      included.
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
        {@html stem.provenance}
      </p>
    </header>

    <!-- headline findings (mirrors the barkup-bench dashboard tiles) -->
    <div
      class="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-3 mt-7.5 mb-3.5"
    >
      {#each stem.tiles as tile (tile.cap)}
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

    <section class="mt-14" id="studies">
      <p class={eyebrowCls}>The study series</p>
      <h2 class="text-[1.22rem] font-600 tracking-[-0.01em] mb-1">
        Every Study, One Page Each
      </h2>
      <p class="text-16px {proseCls} mb-6">
        Every study is pre-registered before its first scored run and gets its
        own page with charts, tables, and a verdict. Grouped by theme:
      </p>
      {#each tracks as group (group.track)}
        <h3 class="font-mono text-[13px] tracking-[0.12em] uppercase text-maximumYellow mt-7 mb-2.5">
          {group.track}
        </h3>
        <ul class="grid grid-cols-1 gap-3">
          {#each group.studies as study (study.slug)}
            <li class="text-15px {proseCls}">
              <a
                href="/research/stem-bench/{study.slug}"
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
      {@html stem.footer}
    </footer>
  </div>

  {#if data.articles.length}
    <section class="mt-14">
      <p class={eyebrowCls}>The article series · every post, in order</p>
      <h2 class="text-[1.22rem] font-600 tracking-[-0.01em] mb-1">
        The Full Series
      </h2>
      <p class="text-16px {proseCls} mb-6">
        Every post in the Stem Bench series, in order. Start at the top for
        the whole story, or jump straight to the latest study writeup.
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
          { num: researchStats.stemBench.studiesDisplay, cap: "pre-registered studies, published as found" },
          { num: researchStats.stemBench.scoredRunsDisplay, cap: "scored cells at temperature 0" },
          { num: researchStats.stemBench.modelsDisplay, cap: "models measured across tiers" },
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
          The harness and every artifact of the research, open source.
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

<!-- chart hover tooltip (positioned by stem-charts.js) -->
<div
  id="tooltip"
  aria-hidden="true"
  class="fixed pointer-events-none bg-[#fcfcfb] text-[#0b0b0b] font-mono text-[12px] leading-[1.45] px-2.5 py-[7px] rounded-[5px] max-w-[300px] opacity-0 transition-opacity duration-100 motion-reduce:transition-none z-10 whitespace-pre-wrap"
></div>
