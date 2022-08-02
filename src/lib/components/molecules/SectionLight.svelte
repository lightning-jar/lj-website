<script lang='ts'>

  // settings
  import { pageXPadding } from "$lib/settings/paddingSettings";

  // props
  export let classes = "";

</script>

<template lang='pug'>
section.pt-4.bg-white.text-OxfordBlue.relative(
  class!="{pageXPadding + ' ' + classes }"
  )
  slot
</template>