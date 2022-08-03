<script lang="ts">

  // components
  import PictureStack from "$a/PictureStack.svelte";

  // global functions
  import { deslugify } from "$functions/helperFunctions";

  // props
  export let slug: string = ""

  const icon = {
    alt: deslugify(slug),
    breakpoints: [['']],
    classes:"block",
    folder: "icons",
    height:"48",
    width:"48",
    fallback: `${slug}.png`,
    sourceFormats: ['svg'],
    slugCommon: slug,
  }


</script>

<template lang='pug'>
PictureStack("{...icon}")
</template>