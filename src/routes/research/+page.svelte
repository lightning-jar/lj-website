<script lang="ts">
// components
import LinkButton from "$components/LinkButton.svelte";

// props
let { data } = $props();
</script>

<div
  class="page-x-padding main-y-padding grid grid-cols-1 gap-12 min-h-screen place-content-start"
>
  <header class="max-w-article">
    <h1 class="display">Research</h1>
    <p class="opacity-90 mb-4">
      We believe good engineering decisions come from evidence, not vibes. So
      we run our own research: pre-registered studies whose hypotheses,
      corpora, and analysis plans are committed publicly before a single
      model is called, with results published as found, corrections included.
    </p>
    <p class="opacity-90">
      The goal is practical guidance for developers of LLM applications:
      claims you can check, recipes you can ship, and open-source packages
      that carry the findings into production.
    </p>
  </header>

  <main class="grid grid-cols-1 gap-10 max-w-article">
    {#each data.projects as project}
      <article class="border border-white/10 rounded p-6">
        <div class="flex items-baseline gap-3 mb-2">
          <h2 class="font-mono text-20px text-maximumYellow">
            {project.name}
          </h2>
          <span
            class="text-11px uppercase tracking-wider opacity-70 font-mono"
          >
            {project.status}
          </span>
        </div>
        <p class="opacity-90 mb-4">{project.summary}</p>
        <LinkButton
          classes="button-accent"
          link={{
            href: `/research/${project.slug}`,
            title: `${project.name} research project`,
          }}
        >
          View the Project
        </LinkButton>
      </article>
    {/each}
  </main>
</div>
