<script lang="ts">
let { data } = $props();
</script>

<div class="page-x-padding main-y-padding !pb-8">
  <h1 class="display max-w-article">
    {data?.banner.heading}
  </h1>
  <p class="max-w-article">{data?.banner.subheading}</p>
</div>

<div
  class="page-x-padding pb-24 grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8"
>
  <div class="list-decimal grid grid-cols-1 gap-8 opacity-90 max-w-article">
    {#each data?.supercategories ?? [] as section, sectionIndex}
      <section class="grid grid-cols-1">
        <h2 class="heading-2" id={section.id}>
          {sectionIndex + 1}. {section.name}
        </h2>
        <p class="mb-5">{section.description}</p>
        <div class="grid grid-cols-1">
          {#each data.technologies.filter((tech) => tech.supercategory === section.id) ?? [] as technology}
            <details class="group border-t border-slate-100/15 last:border-b">
              <summary
                class="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-3 cursor-pointer list-none marker:content-none [&::-webkit-details-marker]:hidden"
              >
                <span
                  class="text-maximumYellow/70 group-open:rotate-90 transition-transform mr-1 select-none"
                  aria-hidden="true">&rsaquo;</span
                >
                <h3
                  id={technology.id}
                  class="text-19px font-serif text-maximumYellow font-700 opacity-95 scroll-mt-24"
                >
                  {technology.name}
                </h3>
                <span class="opacity-80 italic text-15px">
                  {technology.category}
                </span>
                <span class="w-full opacity-70 text-15px leading-snug">
                  {technology.shortDescription}
                </span>
              </summary>

              <div class="pb-5 pt-1 pl-5">
                <!--description -->
                <p class="opacity-90 mb-3">
                  {(technology.description ?? []).join(" ")}
                </p>
                <!-- website link -->
                {#if technology?.link?.href}
                  <p class="opacity-90 mb-3">
                    <a
                      href={technology.link.href}
                      rel="external"
                      title="go to {technology.name} website"
                      class="underline decoration-maximumYellow/40 hover:decoration-maximumYellow underline-offset-4"
                    >
                      Visit {technology.name} &rarr;
                    </a>
                  </p>
                {/if}
                <!-- related article -->
                {#if technology.relatedArticle}
                  <p class="opacity-90 mb-3">
                    Related reading:
                    <a
                      href={technology.relatedArticle.href}
                      class="underline decoration-maximumYellow/40 hover:decoration-maximumYellow underline-offset-4"
                    >
                      {technology.relatedArticle.title}
                    </a>
                  </p>
                {/if}
                <!-- use cases -->
                <div class="opacity-90">
                  <h4 class="font-700 mb-2 leading-none text-maximumYellow">
                    Use Cases:
                  </h4>
                  <ul class="grid grid-cols-1 gap-1 pl-0 ml-0">
                    {#each technology.useCases ?? [] as useCase}
                      <li class="leading-tight list-disc list-inside ml-0">
                        {useCase}
                      </li>
                    {/each}
                  </ul>
                </div>
              </div>
            </details>
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
        {#each data?.supercategories ?? [] as supercategory}
          <a
            href={`#${supercategory.id}`}
            class="text-maximumYellow px-3 py-2 rounded border border-current leading-none text-14px opacity-95 hover:opacity-100"
          >
            {supercategory?.shortName || supercategory?.name}
          </a>
        {/each}
      </nav>

      <!-- list by name  -->
      <nav class="border px-3 pt-4 pb-5 rounded border-slate-100/60 max-h-fit">
        <h2
          class="text-22px font-serif text-maximumYellow font-700 sm:mb-0 mb-3 sr-only"
        >
          Technologies by Name
        </h2>

        <ul class="grid grid-cols-1 gap-3 pl-0 ml-0">
          {#each data.technologies as technology}
            <li class="leading-tight">
              <a
                href="#{technology.id}"
                class="opacity-90 underline decoration-current hover:(text-maximumYellow opacity-100) underline-offset-4"
              >
                {technology.name}
              </a>
            </li>
          {/each}
        </ul>
      </nav>
    </div>
  </aside>
</div>
