<script lang='ts'>

  // settings
  import { pageXPadding } from "$lib/settings/paddingSettings";

  // props
  export let classes = "bg-transparent";
  export let id: string | null = null;

</script>

<template lang='pug'>
section.pt-4.text-white.relative(
  class!="{pageXPadding + ' ' + classes }"
  "{id}"
  )
  slot
</template>