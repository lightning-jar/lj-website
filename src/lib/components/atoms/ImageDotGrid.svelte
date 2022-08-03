<script lang="ts">

  // components
  import PictureStack from "$a/PictureStack.svelte";

  // variables
  const image = {
    alt:"dot pattern",
    breakpoints: [
      // unique slug, [rule 1], [rule 2]
      [''],
    ],
    classes:"block",
    folder: "images",
    height:"185",
    width:"185",
    fallback: "dot-grid.png",
    folder: "images",
    slugCommon: "dot-grid",
    sourceFormats: ['svg'],
  }

</script>

<template lang='pug'>
PictureStack("{...image}")
//picture
  source(
    type="image/svg+xml"
    srcset="/images/dot-grid.svg"
    )
  img.select-none(
    class="w-full h-auto"
    height="185"
    width="185"
    draggable="false"
    loading="lazy"
    alt="circle pattern"
    src="/images/dot-grid.png"
    )
</template>