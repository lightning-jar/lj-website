<script lang="ts">
  // components
  import LinkButton from "$components/LinkButton.svelte";

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
      <article class="max-w-article mb-10">
        {#if story?.thumbnailImage}
          <img
            src={story.thumbnailImage.src}
            alt="{story.customer.name} Logo"
            loading="lazy"
            class="aspect-[5/4] object-cover mb-4 h-160px w-200px rounded overflow-hidden"
          />
        {/if}
        <h3 class="text-24px font-700 font-serif text-maximumYellow mb-3">
          {story?.banner.heading}
        </h3>

        <div class="mb-5 w-full">
          <div class="w-full opacity-90">
            {story?.excerpt ?? "No excerpt available."}
          </div>

          {#if story.tags?.[0]}
            <div class="mt-2 flex gap-2 text-0.9em text-accent">
              {#each story.tags as tag}
                <span class="opacity-90 hover-opacity-100 cursor-pointer"
                  >#{tag}</span
                >
              {/each}
            </div>
          {/if}
        </div>

        {#if story.slug}
          <!-- <a
            class="button-accent"
            title="read full story"
            href="/customer-stories/{story.slug ?? ''}">Read Story</a
          > -->

          <LinkButton
            classes="button-accent"
            link={{
              href: `/customer-stories/${story.slug ?? ""}`,
              title: "read full story",
            }}
          >
            Read Story
          </LinkButton>
        {/if}
      </article>
    {/each}
  </section>
</div>
