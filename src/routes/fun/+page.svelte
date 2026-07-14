<script lang="ts">
// components
import LinkButton from "$components/LinkButton.svelte";
import ProjectTile from "$components/ProjectTile.svelte";

// props
let { data } = $props();
</script>

<div
  class="page-x-padding main-y-padding grid grid-cols-1 gap-12 min-h-screen place-content-start"
>
  <header class="max-w-article">
    <h1 class="display">Fun</h1>
    <p class="opacity-90 mb-4">
      Not everything we build is for a client. Some things we build because
      the itch was there: a tool we wished existed, a concept we wanted to
      understand from the inside, an excuse to try a new technology on
      something with no deadline attached.
    </p>
    <p class="opacity-90">
      Side projects are how we play, and play is how we stay sharp.
      Everything here is open source, so feel free to poke around the code.
    </p>
  </header>

  <main class="grid grid-cols-1 gap-10 max-w-article">
    {#each data.projects as project}
      <ProjectTile
        name={project.name}
        status={project.status}
        summary={project.summary}
      >
        <div class="flex flex-wrap gap-3">
          {#each project.links as link}
            <LinkButton
              classes={link === project.links[0]
                ? "button-accent"
                : "text-yellow-50"}
              link={{ href: link.href, title: `${project.name}: ${link.label}` }}
            >
              {link.label}
            </LinkButton>
          {/each}
        </div>
      </ProjectTile>
    {/each}
  </main>
</div>
