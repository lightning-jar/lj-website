<script lang="ts">
// A curated, hand-picked row of highlights: can point at anything with a
// title and a link (playbook, package, blog article, customer story,
// study, reading-list entry). Edited here by hand, not loader-driven.
// Text-tile layout mirrors HomeLatestResearch so it aligns with the rows
// below it.
interface FeaturedItem {
	kind: string;
	title: string;
	href: string;
}

const featured: FeaturedItem[] = [
	{
		kind: "Playbook",
		title: "The Agent-Readiness & AEO Playbook",
		href: "/research/aeo-bench/playbook",
	},
	{
		kind: "Playbook",
		title: "The Builder's Playbook",
		href: "/research/barkup-bench/playbook",
	},
	{
		kind: "Open Source",
		title: "woof-editor (beta)",
		href: "/packages/woof-editor",
	},
	{
		kind: "Blog",
		title: "What It Means to Make Your Website Agent-Ready",
		href: "/blog/agent-ready-website",
	},
	{
		kind: "Customer Story",
		title: "14 Languages in Days, Not Quarters: CCRTA Sitewide Translation",
		href: "/customer-stories/ccrta-multilingual-translation",
	},
];
</script>

<section class="page-x-padding py-12 border-t border-white/10 w-full">
  <div class="flex items-end justify-between gap-4 mb-6">
    <h2 class="heading-2">Featured</h2>
  </div>

  <div
    class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-5"
  >
    {#each featured as item, index (item.href)}
      <a
        aria-labelledby="featured-title-{index}"
        href={item.href}
        title={item.title}
        class="aspect-[4/3] w-full border border-current rounded-lg overflow-hidden relative flex flex-col justify-between gap-2 p-3 hover:bg-white/5"
      >
        <div class="text-maximumYellow text-13px uppercase tracking-wide">
          {item.kind}
        </div>
        <h3
          id="featured-title-{index}"
          class="font-sans font-400 leading-snug text-15px sm:text-16px line-clamp-4"
        >
          {item.title}
        </h3>
      </a>
    {/each}
  </div>
</section>
