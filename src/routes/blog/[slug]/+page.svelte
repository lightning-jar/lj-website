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
  </article>
</div>
