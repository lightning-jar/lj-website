<script lang='ts'>
  // components
  import PictureStack from "$a/PictureStack.svelte"

  const image = {
    alt:"abstract squiggly shape",
    breakpoints: [],
    classes:"",
    folder: "images",
    height:"179",
    width:"175",
    loading: "lazy",
    onlyScreen: false,
    preload: [],
    fallback: "decoration-3.png",
    slugCommon: "decoration-3",
  }

</script>

<template lang='pug'>
PictureStack("{...image}")
//-picture(class="w-auto h-auto")
  img.block.w-full.h-auto(src="/images/decoration-3.png" width="175" height="179" draggable="false" loading="lazy")
</template>