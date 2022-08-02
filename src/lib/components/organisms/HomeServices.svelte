<script lang='ts'>

  //components
  import TextHeading from "$a/TextHeading.svelte";
  import SectionDark from "$m/SectionDark.svelte";
  import TileServices from "$m/TileServices.svelte";

  import IconWebDesign from "$a/IconWebDesign.svelte";

</script>

<template lang='pug'>

SectionDark
  .text-center.mt-20.mb-20
    TextHeading Digital Services

  // services grid
  .gap-8.grid-cols-2.mb-20(class="md:grid lg:grid-cols-3 ")

    // tile
    TileServices
      IconWebDesign(slot="icon")
      svelte:fragment(slot="heading") Web Design &amp; Development
      svelte:fragment(slot="text")
        | Our process-driven approach to web design and development is engineered to help your organization quickly strategize, prioritize, and execute digital experiences that matter to customers.

    div.h-24.bg-blue-500
    div.h-24.bg-blue-500
    div.h-24.bg-blue-500
</template>