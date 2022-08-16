<script lang="ts">

  // props
  export let classes = '';

  const defaultClasses = [
    'text-xl',
    'lg: text-xl',
    'font-sans',
    'font-semibold',
    'mb-4',
    'text-darkCornflowerBlue',
    'italic'
  ]

  const attributes = {
    class:`${defaultClasses.join(' ')}  ${classes}`
  }

</script>

<template lang='pug'>
h3("{...attributes}")
  slot
</template>