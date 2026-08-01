<script lang="ts">
let { data } = $props();
</script>

<main id="main">
<header class="page-x-padding main-y-padding !pb-8">
  <h1 class="heading-1 max-w-article">
    {data?.heading}
  </h1>
  <p class="max-w-article">{data?.subheading}</p>
</header>

<div class="page-x-padding pb-24">
  <div class="list-decimal grid grid-cols-1 gap-5 opacity-90 max-w-article">
    {#each data?.technologies ?? [] as item}
      <article>
        <div class="sm:flex gap-3 items-baseline">
          <h2
            class="text-22px font-serif text-maximumYellow font-700 mb-3 sm:mb-0"
          >
            <a
              href={item.link.href}
              rel="external"
              title="go to {item.name} website"
              class="opacity-90 underline decoration-maximumYellow/40 hover:decoration-maximumYellow underline-offset-4"
            >
              {item.name}
            </a>
          </h2>
          <div class="opacity-90 italic mb-4 sm:mb-0">
            [{item.license}] - {item.category}
          </div>
        </div>
        {#each item.description as paragraph}
          <p class="opacity-90">
            {paragraph}
          </p>
        {/each}
      </article>
    {/each}
  </div>
</div>
</main>
