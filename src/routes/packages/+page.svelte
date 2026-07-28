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
    <h1 class="display">Packages & Tools</h1>
    <p class="opacity-90 mb-4">
      Software we built for production and published for everyone. These are
      the packages and tools that came out of real client and product work:
      extracted, hardened, documented, and released as open source.
    </p>
    <p class="opacity-90">
      Each one has its own page with the story, the install command, and the
      research or writing behind it. For the lighter side of what we ship,
      see <a
        href="/fun"
        class="underline decoration-maximumYellow/40 hover:decoration-maximumYellow underline-offset-4"
        >Fun</a
      >.
    </p>
  </header>

  <main class="grid grid-cols-1 gap-10 max-w-article">
    {#each data.packages as pkg}
      <ProjectTile name={pkg.name} status={pkg.status} summary={pkg.tagline}>
        <div class="flex flex-wrap gap-3">
          <LinkButton
            classes="button-accent"
            link={{
              href: `/packages/${pkg.id}`,
              title: `${pkg.name}: full package page`,
            }}
          >
            Package page
          </LinkButton>
          {#each pkg.links as link}
            <LinkButton
              classes="text-yellow-50"
              link={{ href: link.href, title: `${pkg.name}: ${link.label}` }}
            >
              {link.label}
            </LinkButton>
          {/each}
        </div>
      </ProjectTile>
    {/each}
  </main>
</div>
