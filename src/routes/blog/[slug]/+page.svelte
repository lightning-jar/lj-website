<script>
  let { data } = $props();

  let formattedDate = $derived(
    data.meta?.date ? new Date(data?.meta.date).toLocaleDateString() : "",
  );
</script>

<div class="page-x-padding min-h-screen pt-8 pb-8">
  <article class="blog-article max-w-prose">
    <h1 class="display">{data.title}</h1>
    <div class="mb-5">{formattedDate}</div>
    {@html data.html}
    {#if data.meta.author === "Kevin Peckham"}
      <div class="flex gap-5 mt-8 bg-slate-100/10 rounded-full max-w-fit pr-8">
        <img
          src="https://lj-01.nyc3.cdn.digitaloceanspaces.com/images/kevin-peckham-sm.webp"
          loading="lazy"
          alt="cartoonized headshot of Kevin Peckham"
          class="rounded-full w-20 h-20 overflow-hidden"
        />
        <div class="grid grid-cols-1 place-content-center text-14px">
          <div class="font-serif font-700">{data.meta.author}</div>
          <div>Principal, Lightning Jar</div>
        </div>
      </div>
    {/if}
  </article>
</div>
