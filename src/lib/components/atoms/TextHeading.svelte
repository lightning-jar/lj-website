<script lang="ts">

  // props
  export let classes = '';
  export let tag = 'h2'

  const defaultClasses = [
    'text-4xl',
    'sm:text-[2.5rem]',
    'md:text-5xl',
    'xl:text-[3.25rem]',
    'font-serif',
    'font-bold',
    '',
  ]

  const attributes = {
    class:`${defaultClasses.join(' ')}  ${classes}`
  }

  const template = `<${tag} class="${defaultClasses.join(' ')}" ></${tag}`

</script>

<template lang='pug'>
  +if('tag == "h2"')
    h2("{...attributes}")
      slot
    +elseif('tag == "h3"')
      h3("{...attributes}")
        slot
    +elseif('tag == "q"')
      q("{...attributes}")
        slot



</template>