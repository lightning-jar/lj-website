<script lang="ts">

  // props
  export let classes = '';

  const defaultClasses = [
    'text-xl',
    'font-sans',
    'font-semibold',
    'mb-4',
    'text-darkCornflowerBlue',
  ]

  const attributes = {
    class:`${defaultClasses.join(' ')}  ${classes}`
  }

</script>

<template lang='pug'>
h3("{...attributes}")
  slot
</template>