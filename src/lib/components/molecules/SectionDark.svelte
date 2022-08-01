<script lang='ts'>

  // settings
  import { pageXPadding } from "$lib/settings/paddingSettings";

  // props
  export let classes = "bg-transparent";

</script>

<template lang='pug'>
section.mt-4.pt-4.text-white.relative(
  class!="{pageXPadding + ' ' + classes }"
  )
  slot
</template>