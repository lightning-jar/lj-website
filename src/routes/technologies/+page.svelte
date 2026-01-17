<script lang="ts">
  // utils
  import { slugify } from "$utils/slugify";

  let { data } = $props();

  let names = $derived.by(() => {
    const names = [];
    for (const section of data?.sections ?? []) {
      for (const item of section.list ?? []) {
        names.push(item.name);
      }
    }
    return names.sort();
  });
</script>

<div class="page-x-padding main-y-padding !pb-8">
  <h1 class="display max-w-article">
    {data?.heading}
  </h1>
  <p class="max-w-article">{data?.subheading}</p>
</div>

<div
  class="page-x-padding pb-24 grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8"
>
  <div class="list-decimal grid grid-cols-1 gap-8 opacity-90 max-w-article">
    <!-- nav -->
    <!-- <nav class="flex gap-4 flex-wrap">
      {#each data?.sections ?? [] as section, sectionIndex}
        <a
          href={`#${slugify(section.heading)}`}
          class="text-maximumYellow px-3 py-2 rounded border border-current leading-none text-14px"
        >
          {section?.handle || section?.heading}
        </a>
      {/each}
    </nav> -->

    {#each data?.sections ?? [] as section, sectionIndex}
      <section class="grid grid-cols-1">
        <h2 class="heading-2" id={slugify(section.heading)}>
          {sectionIndex + 1}. {section.heading}
        </h2>
        <p class="mb-5">{section.description}</p>
        <div class="grid gird-cols-1 gap-5">
          {#each section.list ?? [] as item}
            <article>
              <div class="flex gap-3 items-baseline mb-3">
                <h3
                  class="text-22px font-serif text-maximumYellow font-700 sm:mb-0"
                >
                  <a
                    href={item.link.href}
                    id={slugify(item.name)}
                    rel="external"
                    title="go to {item.name} website"
                    class="opacity-90 underline decoration-maximumYellow/40 hover:decoration-maximumYellow underline-offset-4"
                  >
                    {item.name}
                  </a>
                </h3>
                <div class="opacity-90 italic mb-4 sm:mb-0">
                  {item.category}
                </div>
              </div>
              <!--description -->
              <p class="opacity-90 mb-3">
                {item.description.join(" ")}
              </p>
              <!-- use cases -->
              <div class="opacity-90">
                <h4 class="font-700 mb-2 leading-none">Use Cases:</h4>
                <ul class="grid grid-cols-1 gap-1 pl-0 ml-0">
                  {#each item.useCases ?? [] as useCase}
                    <li class="leading-tight list-disc list-inside ml-0">
                      {useCase}
                    </li>
                  {/each}
                </ul>
              </div>
            </article>
          {/each}
        </div>
      </section>
    {/each}
  </div>

  <!--sidebar -->
  <aside class="hidden lg:flex justify-end">
    <div class="max-w-400px w-full">
      <!-- jump links to sections -->
      <nav class="flex gap-4 flex-wrap mb-8">
        <h2
          class="text-22px font-serif text-maximumYellow font-700 sm:mb-0 mb-3 sr-only"
        >
          Technologies Topics
        </h2>
        {#each data?.sections ?? [] as section, sectionIndex}
          <a
            href={`#${slugify(section.heading)}`}
            class="text-maximumYellow px-3 py-2 rounded border border-current leading-none text-14px"
          >
            {section?.handle || section?.heading}
          </a>
        {/each}
      </nav>

      <!-- list by name  -->
      <nav class="border px-3 pt-4 pb-5 rounded border-current max-h-fit">
        <h2
          class="text-22px font-serif text-maximumYellow font-700 sm:mb-0 mb-3 sr-only"
        >
          Technologies by Name
        </h2>

        <ul class="grid grid-cols-1 gap-2 pl-0 ml-0">
          {#each names as name}
            <li class="leading-tight">
              <a
                href="#{slugify(name)}"
                class="opacity-90 underline decoration-current hover:(text-maximumYellow opacity-100) underline-offset-4"
              >
                {name}
              </a>
            </li>
          {/each}
        </ul>
      </nav>
    </div>
  </aside>
</div>
