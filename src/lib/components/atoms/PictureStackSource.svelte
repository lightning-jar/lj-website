<script lang='ts'>
  export let type = '';
  export let srcset = '';
  export let media = '';
</script>

<template lang='pug'>
source(
  "{type}"
  "{srcset}"
  "{media}"
  )
</template>