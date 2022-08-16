<script lang="ts">

  // props
  export let preload = ['avif']

  // components
  import PictureStack from "$a/PictureStack.svelte"

  const image = {
    alt:"two tigers circle each other",
    breakpoints: [
      // unique slug, [rule 1], [rule 2]
      ['-493', ['min-width', '0px'], ['max-width', '1599.99px']],
      ['-600', ['min-width', '1000px'], ['max-width', '1799.99px']],
      ['-800', ['min-width', '1800px']],
    ],
    classes:"block rounded-lg",
    folder: "images",
    height:"966",
    width:"912",
    loading: "eager",
    onlyScreen: false,
    preload: preload,
    fallback: "lj-tigers-opaque-493.jpg",
    slugCommon: "lj-tigers-transparent",
  }

</script>

<template lang='pug'>
PictureStack("{...image}")
</template>