<script lang="ts">
let { data } = $props();

console.log(data.content);
</script>

<div class="page-x-padding main-y-padding !pb-6">
  <h1 class="display">
    {data?.heading}
  </h1>
  <p>{data?.subheading}</p>
</div>

<div class="page-x-padding pb-24">
  <ol class="list-decimal grid grid-cols-1 gap-4 pl-3 opacity-90 max-w-article">
    {#each data?.termsList ?? [] as term}
      <li>{term}</li>
    {/each}
  </ol>
</div>
