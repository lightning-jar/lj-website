<script lang='ts'>

  // components
  import IconServices from "$a/IconServices.svelte";

  export let iconSlug = '';
  export let heading = '';
  export let text = '';

  const slug = iconSlug;

</script>

<template lang='pug'>
.flex.w-full.h-auto
  .w-12(class="mr-6 flex-none")
    IconServices("{slug}")
  div
    h3.text-2xl.mb-3.font-serif
      | {@html heading}
      span
        slot(name="heading")
    p.prose-lg.text-white.mb-8
      | {@html text}
      span
        slot(name="text")
</template>