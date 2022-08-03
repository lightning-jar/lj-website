<script lang="ts">

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
    slugCommon: "lightning-jar-logo",
    sourceFormats: ['svg', 'webp'],
    width:"432",
  }

</script>

<template lang="pug">
PictureStack("{...image}")
</template>