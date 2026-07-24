<script lang="ts">
// keyworded services strip: names what the studio does in the terms
// people search for, linking into the services and technologies pages
const services = [
	{
		heading: "Web Application Design & Development",
		text: "Websites and web applications, designed and built end to end — SvelteKit, TypeScript, and a static-first bias for speed.",
		href: "/services",
	},
	{
		heading: "Custom Software Development",
		text: "Custom software, portals, and internal tools shaped to how your business actually works — not the other way around.",
		href: "/services",
	},
	{
		heading: "AI & LLM Application Development",
		text: "Custom AI applications and LLM-powered products, grounded in our own published research on how these models behave.",
		href: "/research/barkup-bench",
	},
	{
		heading: "Brand Strategy & Design Systems",
		text: "Brand voice, design systems, and UX optimization — the experience layer that makes the technology feel like you.",
		href: "/services",
	},
];
</script>

<section class="page-x-padding py-12 border-t border-white/10 w-full">
  <div class="flex items-end justify-between gap-4 mb-6">
    <h2 class="heading-2">What We Do</h2>
    <a
      href="/services"
      class="text-maximumYellow hover:underline text-15px whitespace-nowrap"
      >All services →</a
    >
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
    {#each services as service}
      <a
        href={service.href}
        class="border border-current rounded-lg p-4 flex flex-col gap-2 hover:bg-white/5"
      >
        <h3 class="text-maximumYellow font-serif font-700 leading-snug">
          {service.heading}
        </h3>
        <p class="text-15px leading-snug opacity-90">{service.text}</p>
      </a>
    {/each}
  </div>
</section>
