<script lang="ts">
const info = [
	{
		heading: "Title",
		text: "An Introduction to Pimcore",
	},
	{
		heading: "Date",
		text: "4.22.2018",
	},
	{
		heading: "Length",
		text: "00:43:03",
	},
];

const notes = [
	{
		heading: "01:20",
		text: "History of the need for Product Information Management",
	},
	{ heading: "02:36", text: "Origination and the philosophy of Pimcore" },
	{ heading: "03:25", text: "Definition of (DAM) Digital Asset Management" },
	{ heading: "04:18", text: "Definition of (CMS) Content Management" },
	{ heading: "05:00", text: "Who should be interested in Pimcore" },
	{ heading: "06:30", text: "Why Pimcore isn't a turnkey solution" },
	{ heading: "07:30", text: "The value of a unified data approach" },
	{
		heading: "10:30",
		text: "Why it makes sense to have an integrated PIM / DAM / CMS solution",
	},
	{ heading: "11:40", text: "API distribution of data from Pimcore" },
	{ heading: "13:10", text: "Why should companies consider Pimcore?" },
	{ heading: "14:20", text: "What are the advantages of open source?" },
	{ heading: "15:50", text: "Centralized code control for Pimcore releases" },
	{
		heading: "16:48",
		text: "History and duration of Pimcore project + releases",
	},
	{ heading: "17:14", text: "Workflow management with Pimcore" },
	{ heading: "18:47", text: "Localization and multi-language support" },
	{
		heading: "20:00",
		text: "Why companies are unhappy with current solutions",
	},
	{
		heading: "20:33",
		text: "This first Pimcore project in the United States",
	},
	{ heading: "21:35", text: "How Lightning Jar discovered Pimcore" },
	{
		heading: "24:24",
		text: "How eCommerce is an iceberg (in terms of complexity)",
	},
	{
		heading: "25:00",
		text: "How well Pimcore integrates with other systems",
	},
	{
		heading: "26:00",
		text: "Product data architecture as a common pain point",
	},
	{ heading: "28:43", text: "How to get started with Pimcore" },
	{
		heading: "30:14",
		text: "Getting started, the next steps after installation",
	},
	{
		heading: "31:16",
		text: "Typical scenario for new Pimcore user, seeking guidance & help",
	},
	{
		heading: "32:20",
		text: "Why Pimcore is exciting for data architects and system architects",
	},
	{ heading: "33:10", text: "What content managers say about Pimcore" },
	{ heading: "34:02", text: "Why designers like Pimcore" },
	{ heading: "35:19", text: "Getting support for a Pimcore project" },
	{ heading: "35:45", text: "What to look for in a Pimcore partner" },
	{ heading: "39:30", text: "How to learn more about Pimcore" },
];
</script>

<div class="page-x-padding main-y-padding pb-6">
  <h1 class="text-32px mb-2 text-maximumYellow font-700 font-display">
    An Introduction<br /> to Pimcore
  </h1>
  <p class="max-w-prose">This podcast episode was recorded in April 2018</p>
</div>

<div class="page-x-padding pb-6">
  <aside
    class="max-w-prose border border-maximumYellow/50 bg-maximumYellow/5 rounded p-4 sm:p-5"
  >
    <p
      class="text-13px uppercase tracking-wide font-700 text-maximumYellow mb-1"
    >
      2026 update
    </p>
    <p class="max-w-prose">
      This episode is from 2018, and Pimcore's licensing has changed
      significantly since then. The Community Edition moved from GPLv3 to the
      source-available Pimcore Open Core License, and a community fork —
      OpenDXP — now continues the GPLv3 codebase.{" "}
      <a
        href="/blog/opendxp-pimcore-fork"
        class="text-maximumYellow underline decoration-maximumYellow/40 hover:decoration-maximumYellow underline-offset-4"
      >
        Read our analysis: Pimcore or OpenDXP →
      </a>
    </p>
  </aside>
</div>

<div class="page-x-padding pb-24 grid grid-cols-1 gap-12">
  <section class="max-w-prose">
    <h2 class="text-24px mb-2 font-700 font-serif">Let's Talk Pimcore</h2>
    <p class="max-w-prose mb-5">
      Pimcore expert Jim Wagner and Lightning Jar CEO Kevin Peckham discuss the
      ins and outs of Pimcore -- the open source Product Information Management
      (PIM), Digital Asset Management (DAM,) Content Management (CMS), and
      eCommerce platform for enterprises. This podcast episode was recorded in
      April 2018
    </p>
    <h3 class="mb-2 text-18px">This episode answers the questions:</h3>
    <ul class="list-disc pl-3 grid grid-cols-1 gap-1">
      <li>What is Pimcore?</li>
      <li>Is it right for my Company?</li>
      <li>How do I get started?</li>
    </ul>
  </section>

  <section>
    <h2 class="text-24px mb-4 font-700 font-serif">
      Listen Now: "An Introduction to Pimcore"
    </h2>
    <div class="">
      <audio
        class="bg-slate-100 border-oxford border rounded"
        preload="metadata"
        controls
      >
        <source
          src="https://lj-01.nyc3.cdn.digitaloceanspaces.com/audio/01-introduction-to-pimcore.mp3"
          type="audio/mpeg"
        />
        <!-- <source src="audiofile.ogg" type="audio/ogg"> -->
        <!-- fallback for non supporting browsers goes here -->
        <p>
          Your browser does not support HTML5 audio, but you can still
          <a
            href="https://lj-01.nyc3.cdn.digitaloceanspaces.com/audio/01-introduction-to-pimcore.mp3"
            >download the audio</a
          >.
        </p>
      </audio>
    </div>
  </section>

  <section class="max-w-prose">
    <blockquote class="italic text-22px font-serif py-8 border-y">
      "Pimcore says: here are the things that you need to do it your way."
    </blockquote>
  </section>

  {#snippet episodeSection(heading: string, items: typeof info)}
    <section class="max-w-prose">
      <h2 class="text-24px mb-5 font-serif font-700">{heading}</h2>
      <div class="grid grid-cols-[auto_1fr] gap-4 font-mono text-16px">
        {#each items as item}
          <span class="font-500">{item.heading}</span>
          <span class="text-15px">{item.text}</span>
          <hr class="col-span-2" />
        {/each}
      </div>
    </section>
  {/snippet}

  {@render episodeSection("Episode Info", info)}
  {@render episodeSection("Episode Notes", notes)}
</div>
