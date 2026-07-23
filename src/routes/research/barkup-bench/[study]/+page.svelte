<script lang="ts">
import { onMount } from "svelte";

let { data } = $props();

const eyebrowCls =
	"font-mono text-[12.5px] tracking-[0.14em] uppercase text-maximumYellow mb-1.5";
const proseCls = "text-[#e7e9ee] leading-[1.65]";

// Evidence blocks (charts, tables) are set off from prose and from
// each other by dividers: an hr before every chart, and between a
// chart and its table. Studies without charts get no dividers.

// Chart/table numbers: ordinal of each figure and table within the
// study, for headings like "Chart AA.1: …" / "Table AA.1: …".
const figureNumbers = $derived(
	new Map(
		data.study.sections
			.map((s) => s.figure)
			.filter((f): f is NonNullable<typeof f> => Boolean(f))
			.map((f, i) => [f.id, i + 1] as const),
	),
);
const tableNumbers = $derived(
	new Map(
		data.study.sections
			.map((s) => s.table)
			.filter((t): t is NonNullable<typeof t> => Boolean(t))
			.map((t, i) => [t.id, i + 1] as const),
	),
);

onMount(async () => {
	const { initBenchCharts } = await import("../bench-charts.js");
	initBenchCharts();
});
</script>

<div
	class="page-x-padding main-y-padding grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-x-12 gap-y-16 bg-oxford text-cultured"
>
	<div class="max-w-article blog-article">
		<nav class="mb-8">
			<a
				href="/research/barkup-bench"
				class="underline decoration-maximumYellow/40 hover:decoration-maximumYellow underline-offset-4 hover:text-maximumYellow"
			>
				← barkup-bench: all studies
			</a>
		</nav>

		<p class={eyebrowCls}>Study {data.study.letters} · {data.study.track}</p>
		<h1 class="heading-1">
			{data.study.title}
		</h1>

		{#each data.study.sections as section (section.id)}
			<section class="mt-6" id={section.id}>
				<p class="italic">{@html section.eyebrow}</p>
				<h2>{@html section.title}</h2>
				{#if section.body}
					{#each section.body as chunk (chunk.html)}
						{#if chunk.heading}
							<h3>{chunk.heading}</h3>
						{/if}
						<p>
							{@html chunk.html}
						</p>
					{/each}
				{:else}
					<p>
						{@html section.takeaway}
					</p>
				{/if}
				{#if section.figure}
					{@const figureTitle =
						"title" in section.figure ? section.figure.title : undefined}
					<hr class="mt-9 mb-9 border-white/14" />
					<!-- invisible outline boundary: evidence h3s (chart/table)
					     group under this heading rather than the prose section's -->
					<h2 class="sr-only">Charts & Tables</h2>
					{#if figureTitle}
						<h3>
							Chart {data.study.letters}.{figureNumbers.get(section.figure.id)}:
							{figureTitle}
						</h3>
					{/if}
				{/if}
				{#if section.legendId}
					<div
						class="chart-legend"
						id={section.legendId}
					></div>
				{/if}
				{#if section.figure}
					<div
						class="chart"
						id={section.figure.id}
					></div>
				{/if}
				{#if section.table}
					{#if section.figure}
						<hr class="mt-9 mb-9 border-white/14" />
					{/if}
					<!-- Tables render expanded (the collapsed details was a space
					     concession from the single-page dashboard era), introduced
					     by a real heading in the document outline. -->
					<div class="mt-4">
						<h3>
							Table {data.study.letters}.{tableNumbers.get(section.table.id)}:
							{section.table.summary}
						</h3>
						<div class="data-table" id={section.table.id}></div>
					</div>
				{/if}
			</section>
		{/each}

		<footer
			class="mt-14 pt-4.5 border-t border-white/14 {proseCls} flex justify-between gap-4"
		>
			{#if data.previous}
				<a
					href="/research/barkup-bench/{data.previous.slug}"
					class="underline decoration-maximumYellow/40 hover:decoration-maximumYellow underline-offset-4 hover:text-maximumYellow"
				>
					← Study {data.previous.letters}
				</a>
			{:else}<span></span>{/if}
			{#if data.next}
				<a
					href="/research/barkup-bench/{data.next.slug}"
					class="underline decoration-maximumYellow/40 hover:decoration-maximumYellow underline-offset-4 hover:text-maximumYellow"
				>
					Study {data.next.letters} →
				</a>
			{/if}
		</footer>
	</div>

	<aside class="flex lg:justify-end">
		<div class="max-w-480px lg:w-[320px] grid grid-cols-1 gap-6 place-content-start">
			{#if data.study.quote}
				<div
					class="w-full border border-slate-100/10 bg-slate-100/5 rounded px-3 pt-4 pb-5"
				>
					<blockquote
						class="font-serif font-700 leading-relaxed text-maximumYellow text-20px"
					>
						"{data.study.quote}"
					</blockquote>
				</div>
			{/if}
			{#if data.study.related?.length}
				<div
					class="w-full border border-slate-100/10 bg-slate-100/5 rounded px-3 pt-4 pb-5"
				>
					<h2 class="font-mono text-13px tracking-[0.12em] uppercase text-maximumYellow mb-3">
						Related reading
					</h2>
					<ul class="grid grid-cols-1 gap-3">
						{#each data.study.related as article (article.href)}
							<li class="leading-snug">
								<a
									href={article.href}
									class="underline decoration-maximumYellow/40 hover:decoration-maximumYellow underline-offset-4 hover:text-maximumYellow"
								>
									{article.title}
								</a>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
			<div
				class="w-full border border-slate-100/10 bg-slate-100/5 rounded px-3 pt-4 pb-5"
			>
				<h2 class="font-mono text-13px tracking-[0.12em] uppercase text-maximumYellow mb-3">
					Primary sources
				</h2>
				<ul class="grid grid-cols-1 gap-3 leading-snug">
					{#if data.study.brief}
						<li>
							<a
								href="https://github.com/kevinpeckham/barkup-bench/blob/main/docs/{data.study.brief}"
								class="underline decoration-maximumYellow/40 hover:decoration-maximumYellow underline-offset-4 hover:text-maximumYellow"
							>
								Pre-registration ({data.study.brief})
							</a>
						</li>
					{/if}
					<li>
						<a
							href="https://github.com/kevinpeckham/barkup-bench/blob/main/REPORT.md"
							class="underline decoration-maximumYellow/40 hover:decoration-maximumYellow underline-offset-4 hover:text-maximumYellow"
						>
							Full report (REPORT.md)
						</a>
					</li>
				</ul>
			</div>
		</div>
	</aside>
</div>

<!-- chart hover tooltip (positioned by bench-charts.js) -->
<div
	id="tooltip"
	aria-hidden="true"
	class="fixed pointer-events-none bg-[#fcfcfb] text-[#0b0b0b] font-mono text-[12px] leading-[1.45] px-2.5 py-[7px] rounded-[5px] max-w-[300px] opacity-0 transition-opacity duration-100 motion-reduce:transition-none z-10 whitespace-pre-wrap"
></div>
