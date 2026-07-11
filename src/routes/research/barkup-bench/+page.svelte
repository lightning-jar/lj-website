<script lang="ts">
import { onMount } from "svelte";

// components
import LinkButton from "$components/LinkButton.svelte";

// dashboard content transplanted from the results artifact
import benchBody from "./bench-body.html?raw";
import "./bench.css";

// props
let { data } = $props();

onMount(async () => {
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
</script>

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
      The series so far: twenty-one studies, more than 15,000 scored model
      runs, four models, trees from 5 to 1,000 nodes, and editing sessions up
      to 36 edits long. The findings compress to one sentence: give every node
      a stable id, never make the model reproduce anything it is not changing,
      and put everything it must read in front of it. Everything the benchmark
      validated ships in the open-source barkup library, linked below with the
      full article series.
    </p>
  </header>

  <div class="bench">
    {@html benchBody}
    <div id="tooltip" aria-hidden="true"></div>
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
                link={{ href: link.href, title: `${pkg.name} on ${link.label}` }}
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
      the whole story, or jump to the capstone, Stable IDs Are All You Need.
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
