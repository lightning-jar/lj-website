<script lang="ts">

  // components
  import PictureStack from "$a/PictureStack.svelte"

  const image = {
    alt:"two tigers circle each other",
    breakpoints: [
      // unique slug, [rule 1], [rule 2]
      ['-348', ['max-width', '420.99px']],
      ['-493', ['min-width', '578px']]
    ],
    classes:"block rounded-lg",
    folder: "images",
    height:"966",
    width:"912",
    fallback: "lj-tigers-opaque-493.jpg",
    slugCommon: "lj-tigers-transparent",
  }

</script>

<template lang='pug'>
PictureStack("{...image}")
</template>