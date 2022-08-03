<script lang='ts'>


  // props
  export let classes = "bg-transparent";
  export let id: string | null = null;

</script>

<template lang='pug'>
section.mt-4.pt-4.text-white.relative(
  class!="{classes }"
  "{id}"
  )
  slot
</template>