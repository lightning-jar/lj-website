<script lang='ts'>

  // props
  export let classes = '';

</script>

<template lang='pug'>
.relative(
    class!="{classes}"
    class="md:grid md:grid-cols-2"
    )
    div
      slot(name="column-1")
    div
      slot(name="column-2")
</template>