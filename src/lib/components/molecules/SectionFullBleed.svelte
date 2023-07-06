<script lang='ts'>


  // props
  export let classes = "bg-transparent";
  export let id: string | null = null;

</script>

<template lang='pug'>
section.text-white.relative(
  class!="{classes }"
  "{id}"
  )
  slot
</template>