<script lang="ts">
// keyworded services strip: names what the studio does in the terms
// people search for, linking into the services and technologies pages
const services = [
	{
		heading: "Web Application Design & Development",
		text: "Websites and web applications built end to end: SvelteKit, TypeScript, and a static-first bias for speed.",
		href: "/services",
	},
	{
		heading: "Custom Software Development",
		text: "Software, portals, and internal tools shaped to how your business actually works, not the other way around.",
		href: "/services",
	},
	{
		heading: "AI & LLM Application Development",
		text: "AI applications and LLM products, grounded in our own published research on how these models behave.",
		href: "/research/barkup-bench",
	},
	{
		heading: "Agent Readiness & AEO",
		text: "Making your site legible to AI agents, backed by our AEO Bench research so you invest only in what measurably works.",
		href: "/research/aeo-bench",
	},
	{
		heading: "Brand Strategy & Design Systems",
		text: "Brand voice, design systems, and UX optimization: the experience layer that makes the technology feel like you.",
		href: "/services",
	},
];
</script>

<section class="page-x-padding py-12 border-t border-white/10 w-full">
  <div class="flex items-baseline justify-between gap-4 mb-6">
    <h2 class="heading-2">What We Do</h2>
    <a
      href="/services"
      class="view-all-link"
      >All Services
      <span>→</span>
      </a
    >
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">
    {#each services as service}
      <a
        href={service.href}
        class="border border-current rounded-lg p-4 flex flex-col justify-between gap-2 hover:bg-white/5"
      >
        <h3 class="tile-meta">
          {service.heading}
        </h3>
        <p class="tile-text line-clamp-4">{service.text}</p>
      </a>
    {/each}
  </div>
</section>
