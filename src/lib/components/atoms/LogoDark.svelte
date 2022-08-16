<script lang="ts">

  // props
  export let loading: string | null = 'lazy';
  export let preload: string[] = [];

  // components
  import PictureStack from "$a/PictureStack.svelte";

  // variables
  const image = {
    alt:"Lightning Jar logo",
    breakpoints: [['']],
    classes:"block",
    fallback: "lightning-jar-logo.png",
    folder: "images",
    height:"64",
    loading: loading,
    slugCommon: "lightning-jar-logo",
    sourceFormats: ['svg', 'webp'],
    preload: preload,
    width:"432",
  }

</script>

<template lang="pug">
PictureStack("{...image}")
</template>