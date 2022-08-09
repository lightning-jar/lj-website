<script lang='ts'>

  // components
  import IconArrowLeftAlt from "$a/IconArrowLeftAlt.svelte";

  // props
  export let direction: string = 'left'

  // attributes
  const button = {
    class: `absolute bg-maximumYellow h-16 w-16 justify-center items-center inset-y-1/2 -translate-y-8 ${direction}-0 hidden md:flex transition-colors hover:bg-opacity-40 text-oxfordBlue hover:text-maximumYellow`,
  }

</script>

<template lang='pug'>
div("{...button}")
  .w-4.h-4(class!="{(direction == 'left' ? '' : 'rotate-180')}")
    IconArrowLeftAlt

</template>