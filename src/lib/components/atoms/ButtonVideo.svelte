<script lang='ts'>

  // stores
  import { mediaPlayer, youTubeCode } from "$lib/stores/mediaPlayerStore";

  // components
  import IconTriangleRight from "./IconTriangleRight.svelte";

  // props
  export let youTube = '';

  // local functions
  function launchPlayer() {
      $youTubeCode = youTube;
      $mediaPlayer = true;
    }

</script>

<template lang='pug'>
button.bg-titaniumYellow.text-oxfordBlue.px-6.py-3.flex.items-center.justify-center(
  class="rounded-tl-lg rounded-br-lg hover:shadow-lg transition-shadow"
  on:click|stopPropagation!="{launchPlayer}"
  )
  div.mr-3(class="w-[11px]")
    IconTriangleRight
  div
    slot
</template>