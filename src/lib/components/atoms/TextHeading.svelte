<script lang="ts">

  // props
  export let classes = '';

  const defaultClasses = [
    'text-4xl',
    'font-serif',
    'font-bold',
    'mb-4',
  ]

  const attributes = {
    class:`${defaultClasses.join(' ')}  ${classes}`
  }

</script>

<template lang='pug'>
h2("{...attributes}")
  slot
</template>