<script lang='ts'>

  // props
  export let classes = "";

</script>

<template lang='pug'>
a.font-sans.text-xs.opacity-80(
  class!="{(classes) ? classes : ''}"
  )
  slot
</template>