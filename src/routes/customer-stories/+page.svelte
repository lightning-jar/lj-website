<script lang="ts">
// components
import LinkButton from "$components/LinkButton.svelte";

let { data } = $props();
</script>

<div
  class="page-x-padding main-y-padding pb-6 grid grid-cols-1 gap-12 min-h-screen place-content-start"
>
  {#if data?.banner}
    <header class="max-w-prose">
      <h1 class="display">
        {data.banner?.heading}
      </h1>
      <p class="max-w-prose mb-5 empty:hidden">
        {data.banner?.subheading ?? ""}
      </p>
    </header>
  {/if}

  <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-12">
    <main>
      <h2 class="sr-only">Select a Customer Story Below to Read More</h2>
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
    </main>

    {#if data?.clients?.length}
      <aside>
        <h2 class="text-18px font-700 font-serif text-maximumYellow mb-4">
          Customers Past &amp; Present
        </h2>
        <ul
          class="grid grid-cols-2 lg:grid-cols-1 gap-x-6 gap-y-1.5 text-14px opacity-85"
        >
          {#each data.clients as client}
            <li>{client}</li>
          {/each}
        </ul>
      </aside>
    {/if}
  </div>
</div>
