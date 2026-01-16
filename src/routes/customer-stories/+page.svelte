<script lang="ts">
  let { data } = $props();
</script>

<div
  class="page-x-padding main-y-padding pb-6 grid grid-cols-1 gap-12 min-h-screen place-content-start"
>
  {#if data?.banner}
    <section class="max-w-prose">
      <h1 class="display">
        {data.banner?.heading}
      </h1>
      <p class="max-w-prose mb-5 empty:hidden">
        {data.banner?.subheading ?? ""}
      </p>
    </section>
  {/if}

  <section>
    {#each data?.stories ?? [] as story}
      <article class="max-w-article">
        <h3 class="text-24px font-700 font-serif text-maximumYellow mb-3">
          {story?.banner.heading}
        </h3>

        <div class="mb-5">
          {story?.excerpt ?? "No excerpt available."}

          {#if story.customer.solutions?.[0] || story.customer.technologies?.[0]}
            <div class="mt-2 inline-flex gap-2 text-0.9em text-accent">
              {#each [...story.customer.solutions, ...story.customer.technologies] as solution}
                <span>#{solution}</span>
              {/each}
            </div>
          {/if}
        </div>

        {#if story.slug}
          <a
            class="button-accent"
            title="read full story"
            href="/customer-stories/{story.slug ?? ''}">Read Story</a
          >
        {/if}
      </article>
    {/each}
  </section>
</div>
