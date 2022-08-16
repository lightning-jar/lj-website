<script lang='ts'>
  export let type = '';
  export let srcset = '';
  export let media = '';
  export let preload = [];

  const format = type.replace('image/', '').replace('+xml', '')

  //<link rel="preload" href="/assets/img/lightning-jar-logo-04.svg" as="image" type="image/svg+xml">
</script>

<template lang='pug'>

svelte:head
  +if('preload.includes(format)')
    link(
      rel="preload"
      href!="{srcset}"
      media!="{media}"
      as="image"
      type!="{type}")

source(
  "{type}"
  "{srcset}"
  "{media}"
  )
</template>