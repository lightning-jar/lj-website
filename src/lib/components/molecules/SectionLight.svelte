<script lang='ts'>

  // settings
  import { pageXPadding } from "$lib/settings/paddingSettings";

  // props
  export let classes = "";

</script>

<template lang='pug'>
section.bg-white.text-OxfordBlue.relative(
  class!="{pageXPadding + ' ' + classes }"
  )
  slot
</template>