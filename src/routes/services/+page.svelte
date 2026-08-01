<script lang="ts">
// components
import PanelAdvanceArrow from "$components/PanelAdvanceArrow.svelte";

// props
let { data } = $props();

let activePanel = $state(0);
let panelsCount: number = $derived(data?.services?.length ?? 0);
</script>

<main id="main" class="page-x-padding min-h-screen">
  <div class="main-y-padding pb-6">
    <h1 class="heading-1">{data.banner.heading}</h1>
    <p class="max-w-prose"></p>
  </div>

  <div class="grid grid-cols-1 gap-12 relative max-w-560px">
    {#each data.services as service, index}
      {#if index === activePanel}
        <article class="pb-0">
          <h2 class="uppercase text-slate-100 mb-3 font-700 tracking-wider">
            {service.heading}
          </h2>
          <p
            class="text-32px md:text-36px mb-5 font-700 font-serif text-accent leading-tight max-w-540px"
          >
            "{service.text}"
          </p>
          {#if service.body}
            <p class="text-16px md:text-17px leading-relaxed text-slate-200 mb-6 max-w-540px">
              {service.body}
            </p>
          {/if}
          {#if service.links?.length}
            <div class="mt-2 max-w-540px">
              <h3
                class="text-12px uppercase tracking-wider text-slate-400 mb-2"
              >
                Related reading
              </h3>
              <ul class="grid gap-1.5">
                {#each service.links as link}
                  <li>
                    <a
                      href={link.href}
                      class="text-15px text-slate-100 underline-offset-4 hover:text-accent hover:underline"
                    >
                      {link.text}
                    </a>
                  </li>
                {/each}
              </ul>
            </div>
          {/if}
        </article>
      {/if}
    {/each}

    <PanelAdvanceArrow
      onadvance={() => (activePanel = (activePanel + 1) % panelsCount)}
    />
  </div>
</main>
