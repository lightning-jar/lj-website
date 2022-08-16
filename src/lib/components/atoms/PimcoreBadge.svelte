<script lang='ts'>

  // components
  import PictureStack from "$a/PictureStack.svelte";

  // props
  export let href: string = 'https://www.pimcore.com';

  // variables
  const image = {
    alt:"Lightning Jar logo",
    breakpoints: [['']],
    classes:"block",
    fallback: "pimcore-gold-partner.png",
    folder: "images",
    height:"120",
    loading: "lazy",
    slugCommon: "pimcore-gold-partner",
    sourceFormats: ['svg'],
    preload: [],
    width:"100",
  }
</script>

<template lang='pug'>
a.block.mb-8.select-none(
  aria-label="Pimcore Gold Partner"
  class="mix-blend-luminosity hover:mix-blend-normal"
  draggable="false"
  href!="{href}"
  title="we love pimcore"
  )
  PictureStack("{...image}")
</template>